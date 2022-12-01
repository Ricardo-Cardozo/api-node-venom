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

 
venom
.create(
    'sessionName',
    (base64Qr, asciiQR) => {
        console.log(asciiQR); // Optional to log the QR in the terminal
        
        var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};

        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        
        response.type = matches[1];
        response.data = new Buffer.from(matches[2], 'base64');

        io.emit('image', response.toString('base64'))

        var imageBuffer = response;

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

    },
    // statusFind
    (statusSession, session) => {
      console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
      //Create session wss return "serverClose" case server for close
      console.log('Session name: ', session);
      if (statusSession == "notLogged"){
          //To QRCode page
          console.log('statusSession');
          io.emit('message', "Não está logado!");
          
      } else {
        console.log('statusSession');
          io.emit('message', "Está logado!");
      }
    },
    undefined,
    { logQR: false }
)
.then((client) => {
    start(client);
})
.catch((erro) => {
    console.log(erro);
});

function start(client) {

  app.get('/', async (req, res) => {
    await client.onStateChange((state) => {
      io.emit('stt', 'Status: ' + state)
      console.log('State changed: ', state);
      try {
        res.status(200).json({state})
      } catch (error) {
        console.log(error);
      }
    })
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

    
io.emit('ready', './out.png')
 



server.listen(9000, () => {
  console.log('Server started!');
})