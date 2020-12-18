const axios = require('axios')

var mysql = require('mysql');
const con = require('./db/config')
const { selectFilms, insertLink, getShowcateg, getFilm, insertFilm } = require('./db/models/films')
const { getCateg, insertFilmCateg } = require('./db/models/categ')
const { objStat } = require('./db/models/stats')
const puppeteer = require('puppeteer');
var bodyParser = require('body-parser');
var Twig = require("twig")
var express = require('express')
var dateFormat = require("dateformat");

app = express();
app.use('/static', express.static('public'))
app.use(bodyParser.urlencoded());

app.post('/film/search', async function(req, res){
    var query = req.body.query
    var shows = await selectFilms({query})
    .then( (res) => { return res } )
    .catch( (err) => { return [] }  )
    
    res.render('liste.twig', {
        shows : shows
    });
})
app.get('/player/:id', async function(req, res){
    var show = await getFilm({id: req.params.id})
    .then( (res) => { return res[0] } )
    .catch( (err) => { return [] }  )

    var player = ''
    var resp = await axios.get(show.link)
    .then(function (response) {
        return response.data
    })
    .catch(function (error) {
        return false
    })
    if(resp && res != undefined){
        var player = 'https://fito.egybest.network'+resp.split('<iframe class="auto-size" src="')[1].split('"')[0]
    }
    
    res.redirect(player)
})

app.get('/film/show/:id', async function(req, res){
    var show = await getFilm({id: req.params.id})
    .then( (res) => { return res[0] } )
    .catch( (err) => { return [] }  )
    var now = new Date();
    objStat({
        objId: req.params.id,
        type: 1,
        obj: 'show',
        date: dateFormat(now, "yyyy-mm-dd")
    })
    //return res.json(true)
    res.render('player.twig', {
        show
    });
})
app.get('/', async function(req, res){
    var shows = await selectFilms({})
    .then( (res) => { return res } )
    .catch( (err) => { return [] }  )
    //shows = []
    var page = req.query.page !== undefined ? req.query.page : 0
    var max = 32
    var from = page*max
    var total = shows.length
    var newShows = shows.slice(from, from+max)

    res.render('index.twig', {
        shows : newShows,
        pages : total/max
    });
})

app.get('/categorie/:id', async function(req, res){
    var shows = await selectFilms({categ_id: req.params.id, page: 0})
    .then( (res) => { return res } )
    .catch( (err) => { return [] }  )
    //shows = []
    var page = req.query.page !== undefined ? req.query.page : 0
    var max = 32
    var from = page*max
    var total = shows.length
    var newShows = shows.slice(from, from+max)
    var now = new Date();
    objStat({
        objId: req.params.id,
        type: 1,
        obj: 'categ',
        date: dateFormat(now, "yyyy-mm-dd")
    })
    res.render('liste.twig', {
        shows : newShows,
        pages : total/max
    });
})

app.listen(9000, () => {
    console.log(`Server Running PORT: 9000`)
})

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
app.get('/update_films', async function(req, res){
    var categs = await getCateg()
    for(var categ of categs){
        console.log('categ: '+categ.name)
        var categSlug = categ.name
        var categId = categ.id
        var url = 'https://fito.egybest.network/movies/'+categSlug
        let browser = await puppeteer.launch()
        let page = await browser.newPage()

        await page.goto(url, { waitUntil: 'networkidle2' })

        var films = await page.evaluate( () => {
            var fils = document.querySelector('div#movies').innerHTML
            return fils
        })
        var fs = []
        for(var fml of films.split('</a>')){
            fs.push(fml+'</a>')
        }
        
        //await autoScroll(page);
        await page.waitForSelector('#movies')
        var films = await page.evaluate( () => {
            var fils = document.querySelector('div#movies').innerHTML
            return fils
        })
        for(var fml of films.split('</a>')){
            fs.push(fml+'</a>')
        }
        
        //console.log(fs.length)
        var len = fs.length
        for(var filmLink of fs){
            var t = filmLink.split('href="')[1]
            if(t !== undefined){
                if(t.split("http").length > 1){
                    var l = t.split('"')[0]
                    if(l.split('http').length<2) l = 'https://fito.egybest.network'+l
                    //console.log(l)
                    var res = await axios.get(l)
                    .then(function (response) {
                        return response.data
                    })
                    .catch(function (error) {
                        return false
                    })
                    if(res && res != undefined){
                        //var hdL = 'https://fito.egybest.network'+res.split('<iframe class="auto-size" src="')[1].split('"')[0]
                        var title = res.split('<title>')[1].split('</title>')[0].replace('EgyBest', 'website')
                        var nom = res.split('<h1><span itemprop="name">')[1].split('</span>')[0]
                        var year = res.split('</a>)</h1></div>')[0].split('">')[res.split('</a>)</h1></div>')[0].split('">').length-1]
                        nom = nom+`(${year})`
                        if(res.split('</span><img src="')[1] == undefined) continue
                        var image = res.split('</span><img src="')[1].split('"')[0]
                        var desc = res.split('<meta name="description" content="')[1].split('"')[0].replace('EgyBest', 'website')
                        var keywords = res.split('<meta name="keywords" content="')[1].split('"')[0].replace('EgyBest', 'website')
                        var showExist = await getFilm({title})
                        .then( (res) => { return res } )
                        .catch( (err) => { return false }  )
                        console.log('check')
                        if( !showExist || !showExist.length){
                            var resuIns = await insertFilm({title, desc, keywords, nom, image})
                            .then( (res) => { return res } )
                            .catch( (err) => { return false }  )
                            if(resuIns){
                                var id = resuIns.insertId
                                insertFilmCateg({catgId: categId, fId: id})
                                insertLink({ link: l, fId: id })
                                console.log(len)
                                len--
                            }
                        }else{
                            var showCategExist = await getShowcateg({categ_id: categId, show_id: showExist[0].id})
                            .then( (res) => { return res } )
                            .catch( (err) => { return false }  )
                            if( !showCategExist || !showCategExist.length){
                                insertFilmCateg({catgId: categId, fId: showExist[0].id})
                            }
                        }
                        /* var tableJ = res.split('class="dls_table btns full mgb"> <thead>')[1].split('</table>')[0]
                        tableJ = tableJ.split('<tbody>')[1].split('</tbody>')[0]
                        var trs = tableJ.split('<tr>')
                        for(var tr of trs){
                            if(tr && tr != '<tr>'){
                                tr = tr.split('</tr>')[0]
                                var tds = tr.split('<td>')
                                var k = 0
                                for(var td of tds){
                                    td = td.split('</td>')
                                    if(k == 3 ){
                                        var link = {
                                            taille : td[0]
                                        }
                                        var resp = await axios.get('https://fito.egybest.network'+td[1].split('data-url="')[1].split('"')[0])
                                        .then(function (response) {
                                            return response.data
                                        })
                                        .catch(function (error) {
                                            return false
                                        })
                                        console.log(resp)
                                    }
                                    console.log("############")
                                    k++
                                }
                                console.log("==================================")
                            }
                        } */
                    }
                }
            }
        }
    }
    await browser.close()
    res.json('done')
})