const express = require('express');
const helmet  = require('helmet');
const cors = require('cors');



const dossiers = require('./routes/dossiers');
const utilisateurs = require('./routes/utilisateurs');

const app = express();
app.use(express.urlencoded({extended:false}));
app.use(express.json())
app.use(helmet());
app.use(cors());
app.use('/dossiers',dossiers);
app.use('/utilisateurs',utilisateurs);

// Creation de Test

app.get('/',(req,res)=>{
    res.send('Salut le monde')
});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Le serveur est en marche sur le port ${PORT}`)
})
