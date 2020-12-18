const { con } = require('../config')

async function insertFilmCateg(args){
    var query = `
    INSERT INTO scrapping.show_categ(categ_id, show_id) 
    VALUES (${args.catgId},${args.fId})
    `
    return new Promise(function(resolve, reject){
        var result = con.query(query, [], function (error, results, fields) {
            if (error) { console.log(error); return false}
            else resolve(results)
        })
    })
}

async function getCateg(args){
    var query = `
    SELECT * 
    FROM scrapping.categorie`
    return new Promise(function(resolve, reject){
        var result = con.query(query, [], function (error, results, fields) {
            if (error) { console.log(error); return false}
            else resolve(results)
        })
    })
}

module.exports = {
    insertFilmCateg,
    getCateg
}