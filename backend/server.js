

const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nike'
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Email:', email, 'Password:', password);
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuario = rows[0];
        console.log('Usuario encontrado:', usuario);
        const passwordValido = await bcrypt.compare(password, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }
        res.json({ mensaje: 'Inicio de sesión exitoso', usuario: { role: usuario.role, username: usuario.username } });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
});

app.post('/api/register', async (req, res) => {
    const { email, password, role = 'customer' } = req.body;
    try {
        // Verificar si el email ya está registrado
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            // Si el email ya está registrado, retornamos un error
            return res.status(400).json({ mensaje: 'El email ya está registrado' });
        }

        // Si el email no está registrado, procedemos a crear el usuario
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, role]);

        // Retornar respuesta de éxito
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id: result.insertId });
    } catch (error) {
        // En caso de error, retornamos el mensaje
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
});


app.get('/api/products', async (req, res) => {
    const { reference, name, price, description, check, type, img } = req.body;
    try {
        const [rows] = await pool.query ('INSERT INTO products (reference, name, price, description, check, type, img) VALUES (?, ?, ?, ?, ?, ?, ?)', [reference, name, price, description, check, type, img]);
        res.json({ mensaje: 'Producto agregado exitosamente', producto: rows });
    }
    catch (error) {
        res.status(500).json({ mensaje: 'Error al agregar el producto', error });
    }
})

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
