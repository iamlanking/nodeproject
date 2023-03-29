const express = require('express')
const admingoods = express.Router()

const checkLogin = require('../utils/checkLogin')

const db = require('../utils/db')
// 引入formidable
const formidable = require('formidable')
const fs = require('fs')
// 引入阿里oss云存储
const co = require('co')
const OSS = require('ali-oss')
// 配置
const client = new OSS({
  region: "oss-cn-beijing", // 地域
  accessKeyId: "xxx", // keyid
  accessKeySecret: "xxx", // 秘钥
  bucket: "waimaihoutai"
})

const ali_oss = {
  bucket: "waimaihoutai", // 仓库名称
  endPoint: "oss-cn-beijing.aliyuncs.com" // 地域节点
}
// 商家食品信息展示
admingoods.get('/goodslist',checkLogin,(req,res)=>{
  let sql = `select goods.id,goods.foodname,goods.descr,goods.price,goods.foodpic,shoplists.shopname from goods,shoplists where goods.shoplist_id = shoplists.id`
  db.query(sql,(err,data,fields)=>{
    res.render('AdminGoods/admingoodslist', {
      title: '商家食品列表',
      data: data,
      uname: req.session.uname
    })
  })
})


// 商家食品添加页面
admingoods.get('/goodsadd',checkLogin,(req,res)=>{
  let sql = `select id,shopname from shoplists`
  db.query(sql,(err,data,fields)=>{
    res.render('AdminGoods/admingoodsadd', {
      title: '商家食品添加',
      data: data,
      uname: req.session.uname
    })
  })

})

// 食品添加操作
admingoods.post('/goodsdoadd', checkLogin,(req, res) => {
  const form = formidable({
    keepExtensions: true, // 保留图片的后缀名
    uploadDir: './uploads', // 上传图片的存储目录
    multiples: true //允许多图片上传
  })

  form.parse(req, (err, fields, files) => {
        let {
          foodname,
          descr,
          price,
          shoplist_id
        } = fields
        let {
          newFilename,
          filepath
        } = files.foodpic
        // 将数据存储在云服务中
        co(function* () {
          client.useBucket(ali_oss.bucket)  //选中存储的仓库
          //pic 上传文件名字 filePath 上传文件路径
          var result = yield client.put(newFilename,filepath);
          //上传之后删除本地文件
          fs.unlinkSync(filepath);
          // res.setHeader('content-type','text/html;charset=utf-8');
          res.end(JSON.stringify({status:'100',msg:'上传成功'}));

        }).catch((err) => {
          res.end(JSON.stringify({
              status: '101',
              msg: '上传失败 ',
              error:JSON.stringify(err)}));
        })
        // 传入数据库
        let sql = `insert into goods(foodname,foodpic,descr,price,shoplist_id) values('${foodname}','${newFilename}','${descr}','${price}',${shoplist_id})`
        db.query(sql, (err, results, fields) => {
          if (results.affectedRows > 0) {
            res.redirect('/admin/goodslist')
          } else {
            res.redirect('/admin/goodsadd')
          }
        })
      })
})


module.exports = admingoods