const path = require('path');
const express = require('express');
const multer = require('multer');
const { createWorker, OEM, PSM } = require('tesseract.js');

const app = express();

const worker = createWorker({
  cachePath: path.resolve(__dirname, 'tesscache'),
  langPath: path.resolve(__dirname, 'tessdata'),
  logger: (m) => console.log(m),
});

app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, 'images'));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});
const upload = multer({ storage: storage });

app.post('/ocr', upload.single('image'), async (req, res) => {
  const {
    data: { text, oem, psm },
  } = await worker.recognize(req.file.path);
  console.log({ oem });
  console.log({ psm });
  console.log({ text });
  res.json(text.split('\n'));
});

async function start() {
  await worker.load();
  await worker.loadLanguage('eng+chi_sim');
  await worker.initialize('eng');
  await worker.setParameters({
    tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    preserve_interword_spaces: '1',
    tessedit_char_whitelist: '',
  });

  app.listen(8000, () => {
    console.log('Server is running at http://localhost:8000');
  });
}
start();
