require('dotenv').config();
const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const port = process.env.PORT;
const bodyParser = require('body-parser');

app.use(bodyParser.json())
//connect to MySQL
let conn = null;
const connectMySQL = async () => {
    conn = await mysql.createConnection({
        host: process.env.ENV_HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    });
};

//เรียกใช้ ConnectSQL ตอน start server
app.listen(port, async () => {
    await connectMySQL();
    console.log(`Node Running on port: ${port}`);
});

//READ
app.get('/users', async (req, res) => {
    try{
        const result = await conn.query(`SELECT * FROM ${process.env.DB_TABLE}`);
        res.json(result[0]);
    } catch(error){
        console.error('ERROR! Fetching DATA : ', error.message);
        res.status(500).json({ error: 'ERROR! Fetching DATA' });
    };
});

//CREATE
app.post('/users', async (req, res) => {
    const data = req.body;
    try {
        const result = await conn.query(`INSERT INTO ${process.env.DB_TABLE} SET ?`, data);
        const userID = result[0].insertID;
        res.status(201).json({ message: 'Register Completed', userID});
    } catch (error){
        console.error('Register Failed!', error.message);
        res.status(500).json({ error: 'Register Failed!'});
    };
});

//UPDATE
app.put('/users/:id', async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    try{
        const result = await conn.query(`UPDATE ${process.env.DB_TABLE} SET ? WHERE ID = ?`, [data, id]);
        if (result[0].affectedRows === 0){
            return res.status(404).json({ error: 'User Not Found!'});
        };
    }catch(error){
        console.error('Edit Failed!', error.message);
        res.status(500).json({ error: 'Edit Failed!'});
    };
});

//DELETE
app.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    try{
        const result = await conn.query(`DELETE FROM ${process.env.DB_TABLE} WHERE ID = ?`, id)
        if(result[0].affectedRows === 0){
            return res.status(404).json({ error: 'User Not Found!'});
        };
        res.json({ message: 'Account has been Delete!'});
    }catch(error){
        console.error('Can\'t Delete Your Account!', error.message);
        res.status(500).json({ error: 'Can\'t Delete This Account!' })
    }
});