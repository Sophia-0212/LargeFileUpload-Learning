const express = require('express');
const fs = require('fs') // nodeJs内置文件模块
const path = require('path')
const bodyParser = require('body-parser');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './assets');
    },
});
const upload = multer({
    storage
})


const server = express()
server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json())

server.use(express.static('static'))

// 检查文件是否已上传
server.post('/checkUploaded', (req, res) => {
    const { fileHash } = req.body;
    const filePath = path.join(__dirname, 'assets', `${fileHash}-0`);
    if (fs.existsSync(filePath)) {
        res.json({ isUploaded: true });
    } else {
        res.json({ isUploaded: false });
    }
});

server.post('/upload',upload.single('file'), (req, res, next) => {
    fs.rename(`./assets/${req.file.filename}`,`./assets/${req.body.fileHash}-${req.body.chunkIndex}`,()=>{
        let obj = {
            message:'ok'
        }
        res.send(JSON.stringify(obj));
    })
})

//合并切片
server.post('/merge', (req, res, next) => {
    let {fileHash,fileName,total} = req.body;

    let mergePathArr = [];

    //找出所有切片文件
    for(let i=0;i<total;i++){
        mergePathArr.push(`./assets/${fileHash}-${i}`);
    }

    //合并且切片文件
    /*
        to do:合并文件后删除切片文件
    */
    mergePathArr.forEach((path)=>{
        let content = fs.readFileSync(path);

        fs.appendFileSync(`./assets/${fileName}`,content)
        
    })

    let obj = {
        message:'ok',
    }

    res.send(JSON.stringify(obj));

})

server.listen(8080)
