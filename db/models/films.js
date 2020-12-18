const { con } = require('../config')

async function getFilm(args){
    var query = `
    SELECT * 
    FROM scrapping.shows
    INNER JOIN scrapping.egy_link on scrapping.egy_link.show_id = scrapping.shows.id`
    if(args.title) query += ` WHERE title="${args.title}"`
    else query += ` WHERE scrapping.shows.id="${args.id}"`
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
    INNER JOIN scrapping.shows on scrapping.shows.id = scrapping.show_categ.show_id
    WHERE scrapping.shows.type = 1`
    
    if(args.query !== undefined && args.query){
        query+= ` AND (scrapping.shows.nom like "%${args.query}%" or scrapping.shows.title like "%${args.query}%")`
    }
    if(args.categ_id !== undefined && args.categ_id){
        query += `
        AND scrapping.show_categ.categ_id=${args.categ_id}`
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
    getFilm,
    getShowcateg,
    selectFilms,
}