const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const movies = []

let requstMovie = function(url){
	request('https://movie.douban.com/top250',function(error, response, body){
		//res.statusCode状态码为200则表示链接成功
		if(error === null && response.statusCode === 200){
			console.log('链接成功')
			//使用cheerio来解析body（网页内容），提取我们想要的信息
			let e = cheerio.load(body)
			//通过分析网页结构，我们发现豆瓣每部电影都通过item属性隔开
			let movieDiv = e('.item')
			//通过for循环来提取每部电影里的信息
			for (let i = 0; i < movieDiv.length; i++) {
					//takeMovie函数能提取电影名称、评分和封面
	                let movieInfo = takeMovie(movieDiv[i])
	                //console.log('正在爬取' + movieInfo.name)
	                //将提取到的电影放入数组
	                movies.push(movieInfo)
	            }
            console.log(movies);
		}
	})
}

let movie = function(){
    this.id = 0
    this.name = ''
    this.score = 0
    this.pic = ''
}
const takeMovie = function(div){
    let e = cheerio.load(div)
    //将类初始化
    let m = new movie()
    m.name = e('.title').text()
    m.score = e('.rating_num').text()
    var pic = e('.pic')
    //cheerio如果要提取某个属性的内容，可以通过attr()
    m.pic = pic.find('img').attr('src')
    m.id = pic.find('em').text()
    return m
}
const top250Url = function(){
    let l = ['https://movie.douban.com/top250']
    var urlContinue = 'https://movie.douban.com/top250?start='
    let cont = 25
    for (let i = 0; i < 10; i++) {
        l.push(urlContinue+cont)
        cont += 25
    }
    return l
}


//sortMovie回调函数能比较两个对象属性大小
const sortMovie = function(id){
    return function(obj ,obj1){
        let value = obj[id]
        let value1 = obj1[id]
        return value - value1
    }
}
//保存文件
const saveMovie = function(movies){
    let path = 'movie.txt'
    let data = JSON.stringify(movies, null, 2)
    fs.appendFile(path, data, function(error){
        if(error == null){
            console.log('保存成功！')
        } else {
            console.log('保存失败',error)
        }
    })
}
//再次爬取
let requstMovies = function(url){
    request(url, function(error, response, body){
        if (error === null && response.statusCode === 200){
            let e = cheerio.load(body)
            let movieDiv = e('.item')
            for (let i = 0; i < movieDiv.length; i++) {
                let movieInfo = takeMovie(movieDiv[i])
                console.log('正在爬取' + movieInfo.name)
                movies.push(movieInfo)
            }
            //判断movies数量
            if (movies.length === 250){
            	//通过sort将数组内每两个元素放入比较函数
                let sortM = movies.sort(sortMovie('id'))
                //保存文件
                saveMovie(sortM)
            }
        } else {
            log('爬取失败', error)
        }
    })
}
//爬取所有网页
const __main = function(){
    let url = top250Url()
    for (let i = 0; i < url.length; i++) {
        requstMovie(url[i])
        requstMovies(url[i])
    }
}
__main()
// const server = http.createServer((req,res)=>{
//     res.writeHead(200,{'Content-type':'text/html;charset=UTF-8'});
//     res.end("嘿嘿嘿，这是我的第一个Node页面")
// });
// server.listen(8080,'127.0.0.1');
// console.log('Server is running at http://127.0.0.1:8080/');