var express = require('express');
var router = express.Router();
const sharp = require('sharp');
const Path = require('path')

/* GET home page. */
router.get('/', function (req, res, next) {

  res.render('index', {
    title: 'Express'
  });
});

/* GET home page. */
router.get('/captch', async function (req, res, next) {
  let basePath = Path.join(__dirname, '../', 'public', 'images')
  backgroundFile = Path.join(basePath, '350x450.png'),
    part1File = Path.join(basePath, 'part1.png')

  let maxLoop = 10, imgMaxWight = 402, imgMaxheight = 202, randomX = imgMaxWight / 2, randomY = imgMaxheight / 2;
  for (let index = 0; index < maxLoop; index++) {
    randomX = parseInt(Math.random() * imgMaxWight)
    if (randomX > 50 && randomX <= 320) {
      break
    }
  }
  if (randomX < 50 || randomX > 320) {
    randomX = 201
  }

  for (let index = 0; index < maxLoop; index++) {
    randomY = parseInt(Math.random() * imgMaxheight)
    if (randomY > 50 && randomY <= 140) {
      break
    }
  }
  if (randomY < 50 || randomY > 140) {
    randomY = 101
  }


  let imgBuffer = await sharp(backgroundFile)
    .resize({ width: imgMaxWight, height: imgMaxheight })
    .composite([{ input: part1File, top: randomY, left: randomX }])
    .sharpen()
    .withMetadata()
    .webp({ quality: 90 })
    .toBuffer()

  req.session.catchLocaltion = {
    x: randomX,
    y: randomY
  }

  res.set({
    'Content-Type': 'image/png'
  })
  res.send(imgBuffer)

});
router.get('/scroll_panel', async function (req, res, next) {
  let basePath = Path.join(__dirname, '../', 'public', 'images')
  backgroundFile = Path.join(basePath, '350x450.png'),
    part1File = Path.join(basePath, 'part1.png')
  let imgMaxWight = 402, imgMaxheight = 202

  let imgBuffer = await sharp(backgroundFile)
    .resize({ width: imgMaxWight, height: imgMaxheight })
    .extract({ left: req.session.catchLocaltion.x, top: req.session.catchLocaltion.y, width: 60, height: 60 })
    .webp({ quality: 90 })
    .toBuffer()

  res.set({
    'Content-Type': 'image/png'
  })
  res.send(imgBuffer)
})
router.get('/captch_top', function (req, res, next) {
  res.status(200).send({
    top: req.session.catchLocaltion.y
  })
})
router.get('/check_left', function (req, res, next) {
  let left = parseInt(req.query['left'].replace('px', ''))
  let result = false;
  if (left + 5 >= req.session.catchLocaltion.x && left - 5 <= req.session.catchLocaltion.x) {
    result = true
  }
  res.status(200).send({
    result
  })
})
module.exports = router;
