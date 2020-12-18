const { con } = require('../config')

async function getStat(args){
    var query = `
    SELECT id, count 
    FROM scrapping.stats 
    WHERE obj_id= ${args.objId}
    AND date= "${args.date}"
    AND type= ${args.type}
    AND obj="${args.obj}"`
    return new Promise(function(resolve, reject){
        var result = con.query(query, [], function (error, results, fields) {
            if (error) { console.log(error); return false}
            else resolve(results)
        })
    })
}

async function insertStat(args){
    var query = `
    INSERT INTO scrapping.stats(obj_id, date, count, type, obj) VALUES (${args.objId},"${args.date}", 1,${args.type},"${args.obj}")`
    return new Promise(function(resolve, reject){
        var result = con.query(query, [], function (error, results, fields) {
            if (error) { console.log(error); return false}
            else resolve(results)
        })
    })
}
async function updateStat(args){
    var query = `
    UPDATE scrapping.stats SET count=${args.count} WHERE id=${args.id}`
    return new Promise(function(resolve, reject){
        var result = con.query(query, [], function (error, results, fields) {
            if (error) { console.log(error); return false}
            else resolve(results)
        })
    })
}
async function objStat(args){
    var stat = await getStat(args)
    .then( (res) => { return res } )
    .catch( (err) => { return [] }  )

    if(!stat.length){
        var statI = await insertStat(args)
        .then( (res) => { return res } )
        .catch( (err) => { return [] }  )
    }else{
        var stat = await updateStat({id: stat[0].id, count: stat[0].count+ 1})
        .then( (res) => { return res } )
        .catch( (err) => { return [] }  )
    }
    return true
}

module.exports = {
    objStat
}