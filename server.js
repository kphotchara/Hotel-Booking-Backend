const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser=require('cookie-parser');
const mongoSanitize=require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors')
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

dotenv.config({path:'./config/config.env'});

connectDB();

const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter=rateLimit({
    windowsMs:10*60*1000,//10 min 
    max:100
});
app.use(limiter);
app.use(hpp());
app.use(cors());

// const hospitals =require('./routes/hospitals');
// const auth = require('./routes/auth');
// const appointments = require('./routes/appointments')

// app.use('/api/v1/hospitals',hospitals);
// app.use('/api/v1/auth',auth);
// app.use('/api/v1/appointments',appointments);

app.get('/', (req,res) => {
    // res.send('<h1>hello from express</h1>');
    // res.send({name:'Bard'});
    // res.json({name:'Bard'});
    // res.sendStatus(400);
    // res.status(400).json({success:false});

    res.status(200).json({success:true,data:{id:1}});

});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT,console.log('Server running in',process.env.NODE_ENV,'mode on port',PORT));

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
})

const swaggerOptions={
    swaggerDefinition:{
        openapi : '3.1.0',
        info : {
            title : 'Library API',
            version : '1.0.0',
            description : 'A simple Express VacQ API'
        },
        servers:[
            {
                url : 'http://localhost:5000/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'],
};

const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs));

