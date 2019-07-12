const express = require('express');
const util = require('util');
const router = express.Router();
const pool = require('../database/db');

router.get('/',(req,res)=>{
  res.status(200).send({
      "message":"On est entrain de test le module Utilisateur"
  });
});

router.post('/',(req, res)=>{
   const {nom,utilisateur, mot2pass } = req.body;
   res.status(200).send({
      "nom":nom,
      "utilisateur":utilisateur,
      "mot2pass":mot2pass,
      "message":"Utilisateur Cree"
   });
});


module.exports = router;
