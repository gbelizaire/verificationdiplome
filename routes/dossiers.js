const express = require('express');
const util = require('util');
const router = express.Router();
const pool = require('../database/db');

//let servIp= "http://192.168.27.145:3000"
//let servIp= "http://172.20.10.5:3000"
 let servIp= "http://localhost:3000";




function ConvertDate(dat){
   return dat.substr(0,4).concat("/").concat(dat.substr(4,2)).concat("/").concat(dat.substr(6,2));
}
//router.get('/',test)
//if (err) throw new Error(err);

router.get('/:codeMat',(req,res)=>{
    
    //console.log(req.params.codeMat);
     if(isNaN(parseInt(req.params.codeMat))){
         res.send({
              erreur:true,
              message:"Il daut saisir des chiffres simplement"
              });
     }else if(req.params.codeMat.length >10){
        res.send({
            erreur:true,
            message:"Le matricule doit etre de 10 digits au maximum"
            });
    }else{
         
         let req2 ='SELECT d.matricule, d.nom, d.prenom, d.sexe,d.Date,d.Section,d.Annee,res.Session,';
          req2 +='res.Ordinaire_1+res.Ordinaire_2+res.Ordinaire_3+res.Ordinaire_4+res.Ordinaire_5+res.Ordinaire_6+res.Ordinaire_7+res.Ordinaire_8 AS NotesOrdinaire'; 
          req2 +=', res.ExtraOrdinaire_1+res.ExtraOrdinaire_2+res.ExtraOrdinaire_3+res.ExtraOrdinaire_4+res.ExtraOrdinaire_5+res.ExtraOrdinaire_6+res.ExtraOrdinaire_7+res.ExtraOrdinaire_8 AS NotesExtraOrdinaire';
          req2 +=' FROM dossiers d, dosexamens res WHERE d.Identifiant = res.Identifiant and res.Peut_Imprimer=\'1\' and d.matricule =? order by 2';
          
	try{
//'SELECT d.matricule, d.nom, d.prenom, d.sexe,d.DATE,d.Section FROM dossiers d, dosexamens res WHERE d.Identifiant = res.Identifiant and d.Matricule =? order by 2'
            pool.query(req2, req.params.codeMat,function (err, result, fields) {
                if (err) {
                    res.status(509).json({
                        "erreur":err.message
                    });
                }
                if(result.length<1){
                    res.status(200).json({
                        message :" Pas de donnees pour le candidat dont le code est "+req.params.codeMat,
                    });
    
                }else{
                    res.status(200).json({
                        data:result.map( r =>{
                                       // console.log(r); 
					let Dat_ = r.Date.length > 5 ? new Intl.DateTimeFormat('fr-FR').format(new Date(ConvertDate(r.Date))) : "N/A";
                                            return {
					    Matricule: r.matricule,	
                                            nom: r.nom,  
                                            prenom: r.prenom,
                                            sexe :r.sexe,
                                            dateNaiss: Dat_,
											Session:r.Session,
                                            Section: r.Section,
											Annee:r.Annee,
                                            NotesOrdinaire: r.NotesOrdinaire,
                                            NotesExtraOrdinaire: r.NotesExtraOrdinaire
                                            }
                                            
                                    })
                            })
                }
                
            });
    }catch(err){
            res.send({
                erreur:true,
                 message:err.message
            });
    }
      
} 
   
});



router.get('/totCoef/:an/:sect/:sess',(req,res)=>{
    // console.log(req.params);
    try{
        let req_ ="SELECT d.`Annee`,d.`Section`,d.`Session` ,d.`CoefEcrit_1`+d.`CoefEcrit_2`+d.`CoefEcrit_3`+d.`CoefEcrit_4`+d.`CoefEcrit_5`+d.`CoefEcrit_6`+d.`CoefEcrit_7`+d.`CoefEcrit_8`+d.`CoefEcrit_9`+d.`CoefEcrit_10` AS TotCoef ";
        //req_ +=" FROM detsectionbb AS d WHERE d.`Annee`='"+req.params.an+"' AND d.`Section`='"+req.params.sect+"' AND d.`Session`='"+req.params.sess+"'";
        req_ +=" FROM detsectionbb AS d WHERE d.`Annee`= ? AND d.`Section`= ?";
        pool.query(req_,[req.params.an,req.params.sect],function (err, result, fields) {
            if (err) throw new Error(err);
            if(result.length<1){
                res.status(200).json({
                    message :" Pas de donnees pour la matiere dont le code est "+req.params.codeMat,
                });

            }else{
               let ResTotCoef={};
               let r = result[0];
              
               ResTotCoef.Annee = r.Annee;
               ResTotCoef.Section = r.Section;
               ResTotCoef.Session = r.Session;
               ResTotCoef.TotCoef  = r.TotCoef;
              
               res.status(200).json({
                    data:ResTotCoef
                        });
            }
            
        });
}catch(err){
        console.log(err.message)
    }
});

router.get('/resultat/:identifiant',(req,res)=>{
    console.log(req.params.identifiant)
    try{
        pool.query('SELECT * FROM dosexamens WHERE Identifiant= ?', req.params.identifiant,function (err, result, fields) {
            if (err) throw new Error(err);
            if(result.length<1){
                res.status(200).json({
                    message :" Pas de donnees pour la matiere dont le code est "+req.params.codeMat,
                });

            }else{
               let ResCert={};
               let r = result[0];
              
               ResCert.Matricule = r.Matricule;
               ResCert.Section = r.Section;
               ResCert.Identifiant = r.Identifiant;
               ResCert.Session = r.Session;
               ResCert.Annee = r.Annee;
               ResCert.TotOrdinaire  = parseInt(r.Ordinaire_1)+parseInt(r.Ordinaire_2)+parseInt(r.Ordinaire_3)+parseInt(r.Ordinaire_4)+parseInt(r.Ordinaire_5)+parseInt(r.Ordinaire_6)+parseInt(r.Ordinaire_7)+parseInt(r.Ordinaire_8);
               ResCert.TotExtra  = parseInt(r.ExtraOrdinaire_1)+parseInt(r.ExtraOrdinaire_2)+parseInt(r.ExtraOrdinaire_3)+parseInt(r.ExtraOrdinaire_4)+parseInt(r.ExtraOrdinaire_5)+parseInt(r.ExtraOrdinaire_6)+parseInt(r.ExtraOrdinaire_7)+parseInt(r.ExtraOrdinaire_8);
               
               ResCert.lien = `${servIp}/dossiers/${r.Matricule}`;
               res.status(200).json({
                    data:ResCert
                        });
            }
            
        });
}catch(err){
        console.log(err.message)
    }
});


module.exports= router;