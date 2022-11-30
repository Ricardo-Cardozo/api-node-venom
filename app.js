const venom = require('venom-bot');
const express = require('express')
const cors = require('cors')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const fs = require('fs')

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({credentials: true, origin: '*'}))
app.use(express.static(__dirname + '/images'))

io.on('connection', (socket) => {
  console.log('User connected' + socket.id);

  socket.on('message', () => {
    venom
    .create({
      session: 'session-name', //name of session
      multidevice: true, // for version not multidevice use false.(default: true)
      headless: false,
      catchQR: (base64Qr, asciiQR) => {
        console.log(asciiQR);
        var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
          response = {};

        if (matches.length !== 3) {
          return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer.from(matches[2], 'base64');

        var imageBuffer = response;

        socket.emit('image', response.toString('base64'))

        require('fs').writeFile(
          './images/out.png',
          imageBuffer['data'],
          'binary',
          function (err) {
            if (err != null) {
              console.log(err);
            }
          }
        );
        undefined,
        { logQR: false }
      },
    })
    .then((client) => start(client))
    .catch((erro) => {
      console.log(erro);
    });
  })

  function start(client) {

    client.onStateChange((state) => {
      socket.emit('message', 'Status: ' + state)
      console.log('State changed: ', state);
    })

    //.match(/[A-Za-z0-9_]+/)
    client.onMessage(async (message) => {
      if (message.body === 'oi') {
        try {
          await client.sendLinkPreview(
            message.from,
            'https://www.youtube.com/watch?v=V1bFr2SWP1I',
            `Olá bem vindo ao Play Dj's, entre em nosso site e faça um orçamento ou deixe sua pergunta aqui, responderemos assim que possível.`,
          )
        } catch (error) {
          console.log('Error', error);
        }
      }
    })
  
    app.post('/send-message', async (req, res) => {
      const {name, secondname, number, valor} = req.body
  
      console.log(req.body);
  
      if (!name || !number || !secondname || !valor) {
        return res.status(422).json({message: 'Nome e contato são obrigatórios!'})
      }
  
      const numberDDD = number.substr(0, 2)
      const numberUser = number.substr(-8, 8)
    
      const contact = '55' + numberDDD + numberUser + '@c.us'
  
      try {
        await client.sendText(contact, `Você escolheu o plano ${valor}, aguarde! Logo enviaremos todos os detalhes do seu orçamento!`)
        await client.sendText(`554797301392@c.us`, `Cliente ${name} ${secondname}, número: ${number} escolheu plano ${valor}`)
        res.status(200).json({message: 'Mensagem enviada com sucesso'})
      } catch (error) {
        console.log('Error', error);
      }
    })
  } 

  socket.on('ready', () => {
    setTimeout(() => {
      socket.emit('ready', './out.png')
    }, 3000)
  })
})

server.listen(9000, () => {
  console.log('Server started!');
})