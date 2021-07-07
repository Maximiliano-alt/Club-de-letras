//1. se invoca a express
const express = require('express'); //framework principal

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
//8. invocamos al modulo de conexion
const connection = require('./database/db');

//9. estableciendo las rutas

console.log(__dirname);


app.get('/login', (req, res) => { //login
    res.render('login');
})
app.get('/registro', (req, res) => { //Sing Up
    res.render('registro');
})

//10. Registracion
app.post('/registro', async(req, res) => {
    const user = req.body.user;
    const name = req.body.name;
    const date = req.body.date;
    const mail = req.body.mail;
    const pass = req.body.pass;
    //se usa una variable para encriptar la contrasenia
    let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET ?', { user: user, name: name, pass: passwordHaash }, async(error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.render('registro', {
                alert: true,
                alertTitle: "Registro",
                alertMessage: "Registro Exitoso!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 5000,
                ruta: ''
            })
        }
    })
})

//11. Autenticacion con el login
app.post('/auth', async(req, res) => {
        const user = req.body.user;
        const pass = req.body.pass;
        let passwordHaash = await bcryptjs.hash(pass, 8);
        if (user && pass) {
            connection.query('SELECT * FROM users WHERE user = ?', [user], async(error, results) => {
                if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))) { //si no se encuentra nada en la tabla o no coincide la pass se muestra un error en pantalla
                    res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Usuario o contrasena incorrectas",
                        alertIcon: "error",
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                } else { //si se encuentra registrado se envia un mensaje de success
                    req.session.loggedIn = true; //variable de sesion para autenticar en las demas paginas
                    req.session.name = results[0].name; //variable de sesion
                    res.render('login', {
                        alert: true,
                        alertTitle: "Conexion exitosa",
                        alertMessage: "Login Correcto!",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: ''
                    });
                }
            })
        } else {

            res.render('login', { //si no entrega ningun dato
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Porfavor ingrese un usuario y contrasena",
                alertIcon: "warning",
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });
        }
    })
    //12. autenticacion de paginas
app.get('/', (req, res) => {
        if (req.session.loggedIn) {
            res.render('index', {
                login: true,
                name: req.session.name
            });
        } else {
            res.render('index', {
                login: false,
                name: 'Debe iniciar sesion'
            })
        }
    })
    //13. log out
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})
app.listen(3000, (req, res) => { //funcion para correr el servidor
    console.log('SERVER RUNNING IN http://localhost:3000');
})