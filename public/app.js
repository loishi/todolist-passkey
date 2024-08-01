const { startRegistration, startAuthentication } = SimpleWebAuthnBrowser;

async function register() {
    try {
        const optionsRes = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const options = await optionsRes.json();

        const attResp = await startRegistration(options);

        const verificationRes = await fetch('/auth/register-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attResp),
        });

        const verificationResult = await verificationRes.json();

        if (verificationResult.verified) {
            alert('Registration successful! Please login.');
        } else {
            alert('Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Registration failed. Please try again.');
    }
}

async function login() {
    try {
        const optionsRes = await fetch('/auth/login', { method: 'POST' });
        const options = await optionsRes.json();

        const attResp = await startAuthentication(options);

        const verificationRes = await fetch('/auth/login-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attResp),
        });

        const verificationResult = await verificationRes.json();

        if (verificationResult.verified) {
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('todo-section').style.display = 'block';
            document.getElementById('user-welcome').textContent = verificationResult.user.username;
            loadTodos();
        } else {
            alert('Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed. Please try again.');
    }
}

async function logout() {
    try {
        await fetch('/auth/logout', { method: 'POST' });
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('todo-section').style.display = 'none';
        document.getElementById('todo-list').innerHTML = '';
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

async function loadTodos() {
    try {
        const res = await fetch('/todos');
        const todos = await res.json();
        const todoList = document.getElementById('todo-list');
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="updateTodo('${todo.id}', this.checked)">
                <span>${todo.title}</span>
                <button onclick="deleteTodo('${todo.id}')">Delete</button>
            `;
            todoList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading todos:', error);
    }
}

async function addTodo() {
    const title = document.getElementById('new-todo').value;
    if (!title) return;

    try {
        await fetch('/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        });
        document.getElementById('new-todo').value = '';
        loadTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
    }
}

async function updateTodo(id, completed) {
    try {
        await fetch(`/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed }),
        });
    } catch (error) {
        console.error('Error updating todo:', error);
    }
}

async function deleteTodo(id) {
    try {
        await fetch(`/todos/${id}`, { method: 'DELETE' });
        loadTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
}