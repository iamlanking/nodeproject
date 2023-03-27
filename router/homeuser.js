const express = require('express')
const homeuser = express.Router()

// 引入mysql
const db = require('../utils/db')
const session = require('../utils/setsession')
homeuser.use(session)

// 设置路由
// 展示会员信息
homeuser.get('/homeuserlist', (req, res) => {
  // 查询数据展示会员信息
  let sql = `select * from users order by id desc`
  db.query(sql, (err, data, fields) => {
    res.render('HomeUser/homeuserlist', {
      title: '会员列表',
      data: data,
      uname: req.session.uname
    })
  })
})

// 会员搜索操作
homeuser.get('/homeusersearch', (req, res) => {
  let {
    keywords
  } = req.query
  // 查询数据展示会员信息
  let sql = `select * from users where username like "%${keywords}%"`
  db.query(sql, (err, data, fields) => {
    res.render('HomeUser/homeuserlist', {
      title: '会员列表',
      data: data,
      uname: req.session.uname
    })
  })
})

// 会员详细信息查询
homeuser.get('/homeuserinfo', (req, res) => {
  let {
    id
  } = req.query
  // 查询数据展示会员信息
  let sql = `select * from user_info where u_id = ${id}`
  db.query(sql, (err, data, fields) => {
    res.render('HomeUser/homeuserinfo', {
      title: '会员详细信息',
      data: data,
      uname: req.session.uname
    })
  })
})

homeuser.get('/homeuseraddress', (req, res) => {
  let {
    username
  } = req.query

  // 查询数据展示会员信息
  let sql = `select * from address where username = "${username}"`
  db.query(sql, (err, data, fields) => {
    res.render('HomeUser/homeuseraddress', {
      title: '会员收获地址',
      data: data,
      uname: req.session.uname
    })
  })
})

// 暴露接口
module.exports = homeuser