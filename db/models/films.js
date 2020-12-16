const { con } = require('../config')

async function getFilmByTitle(args){
    var query = `
    SELECT id, title, description, keywords, type 
    FROM scrapping.shows 
    WHERE title="${args.title}"
    `
    return new Promise(function(resolve, reject){
        var result = con.query(query, [], function (error, results, fields) {
            if (error) { console.log(error); return false}
            else resolve(results)
        })
    })
}
async function getShowcateg(args){
    var query = `
    SELECT * FROM scrapping.show_categ 
    WHERE categ_id=${args.categ_id} and show_id=${args.show_id}
    `
    return new Promise(function(resolve, reject){
        var result = con.query(query, [], function (error, results, fields) {
            if (error) { console.log(error); return false}
            else resolve(results)
        })
    })
}
async function insertFilm(args){
    var query = `
    INSERT INTO scrapping.shows(nom, image,title, description, keywords, type) 
    VALUES ("${args.nom}", "${args.image}", "${args.title}","${args.desc}","${args.keywords}",1)
    `
    return new Promise(function(resolve, reject){
        var result = con.query(query, [], function (error, results, fields) {
            if (error) { console.log(error); return false}
            else resolve(results)
        })
    })
}
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
async function insertLink(args){
    var query = `
    INSERT INTO scrapping.egy_link(link, show_id) 
    VALUES ("${args.link}",${args.fId})
    `
    return new Promise(function(resolve, reject){
        var result = con.query(query, [], function (error, results, fields) {
            if (error) { console.log(error); return false}
            else resolve(results)
        })
    })
}
async function getPlayer(args){
    var query = `
    SELECT scrapping.link FROM egy_link 
    WHERE show_id=${args.id}
    `
    return new Promise(function(resolve, reject){
        var result = con.query(query, [], function (error, results, fields) {
            if (error) { console.log(error); return false}
            else resolve(results)
        })
    })
}

async function selectFilms(args){
    var query = `
    SELECT * 
    FROM scrapping.show_categ 
    INNER JOIN scrapping.shows on show_id = scrapping.show_categ.show_id
    WHERE type = 1`

    if(args.query){
        query+= ` AND (scrapping.shows.nom like "%${args.query}%" or scrapping.shows.title like "%${args.query}%")`
    }
    if(args.categ_id){
        query += `
        AND scrapping.show_categ.id=${args.categ_id}`
    }

    if(args.page !== undefined){
        var limit = 32
        var offset = limit*args.page
        query += ` LIMIT ${limit} OFFSET ${offset}`
    }
    return new Promise(function(resolve, reject){
        var result = con.query(query, [], function (error, results, fields) {
            if (error) { console.log(error); return false}
            else resolve(results)
        })
    })
}

module.exports = {
    insertFilm,
    insertLink,
    insertFilmCateg,
    getFilmByTitle,
    getShowcateg,
    selectFilms
}