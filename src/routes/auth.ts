import express from 'express';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { rpID, expectedOrigin } from '../server';
import prisma from '../db';
import { v4 as uuidv4 } from 'uuid';
import { isoUint8Array, isoBase64URL } from '@simplewebauthn/server/helpers';

const router = express.Router();

router.post('/register', async (req, res) => {
  const userId = uuidv4();
  const username = `user_${userId.slice(0, 8)}`;

  const user = await prisma.user.create({ data: { id: userId, username } });

  const options = await generateRegistrationOptions({
    rpName: 'Todo Passkey App',
    rpID,
    userID: isoUint8Array.fromUTF8String(userId),
    userName: username,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
  });

  req.session.currentChallenge = options.challenge;
  req.session.userId = user.id;

  res.json(options);
});

router.post('/register-verify', async (req, res) => {
  const { userId, currentChallenge } = req.session;

  if (!userId || !currentChallenge) {
    return res.status(400).json({ error: 'Invalid session' });
  }

  const verification = await verifyRegistrationResponse({
    response: req.body,
    expectedChallenge: currentChallenge,
    expectedOrigin,
    expectedRPID: rpID,
  });

  if (verification.verified && verification.registrationInfo) {
    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

    await prisma.device.create({
      data: {
        id: credentialID,
        credentialPublicKey,
        counter: BigInt(counter),
        userId,
      },
    });

    req.session.currentChallenge = undefined;
    req.session.userId = undefined;

    res.json({ verified: true });
  } else {
    res.status(400).json({ error: 'Verification failed' });
  }
});

router.post('/login', async (req, res) => {
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
  });

  req.session.currentChallenge = options.challenge;

  res.json(options);
});

router.post('/login-verify', async (req, res) => {
  const { currentChallenge } = req.session;

  if (!currentChallenge) {
    return res.status(400).json({ error: 'Invalid session' });
  }

  const device = await prisma.device.findUnique({
    where: { id: req.body.id },
    include: { user: true },
  });

  if (!device) {
    return res.status(400).json({ error: 'Device not found' });
  }

  const verification = await verifyAuthenticationResponse({
    response: req.body,
    expectedChallenge: currentChallenge,
    expectedOrigin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: device.id,
      credentialPublicKey: device.credentialPublicKey,
      counter: device.counter,
    },
  });

  if (verification.verified) {
    await prisma.device.update({
      where: { id: device.id },
      data: { counter: BigInt(verification.authenticationInfo.newCounter) },
    });

    req.session.currentChallenge = undefined;
    req.session.userId = device.user.id;

    res.json({ verified: true, user: { id: device.user.id, username: device.user.username } });
  } else {
    res.status(400).json({ error: 'Verification failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.json({ success: true });
  });
});

export default router;