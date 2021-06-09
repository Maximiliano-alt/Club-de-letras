//1. se invoca a express
const express = require('express');

//2. se setea urlencoded para capturar los datos del formulario y para no tener errores
const app = express(); //para usar todos los metodos que usa la libreria
app.use(express.urlencoded({ extended: false })); //para que los datos no sean undefined y para trabajar con el formato json
app.use(express.json());

//3. se invoca a dotenv para tomar las variables de entorno
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

//4. directorio donde estaran los archivos estaticos
app.use('/resources', express.static('css'));
app.use('/resources', express.static(__dirname + '/css'));

//5. motor de plantillas ejs
app.set('view engine', 'ejs');

//6. se invoca al modulo para hacer el hashing de password (bcryptjs)
const bcryptjs = require('bcryptjs');

//7. variable de session
const session = require('express-session');
app.use(session({
    secret: '1234',
    resave: true,
    saveUninitialized: true
}));


console.log(__dirname);
app.get('/', (req, res) => {
    res.send('hola mundo');
}) app.listen(3000, (req, res) => { //funcion para correr el servidor
    console.log('SERVER RUNNING IN http://localhost:3000');
})