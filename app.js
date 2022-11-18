const venom = require('venom-bot');
const express = require('express')
const cors = require('cors')
const app = express()
const fs = require('fs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({credentials: true, origin: '*'}))

venom
  .create({
    session: 'session-name', //name of session
    multidevice: true, // for version not multidevice use false.(default: true)
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
      fs.writeFile(
        'out.png',
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

function start(client) {
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

  app.get('/', (req, res) => {
    
  })

  app.post('/send-message', async (req, res) => {
    const {name, secondname, number, valor} = req.body

    console.log(req.body);

    if (!name || !number || !secondname || !valor) {
			return res.status(422).json({message: 'Nome e contato são obrigatórios!'})
		}

    //const contact = `55${number}@c.us`
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


app.listen(9000, () => {
  console.log('Server started!');
})