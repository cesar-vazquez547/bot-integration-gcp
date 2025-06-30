const restify = require('restify');
const { BotFrameworkAdapter } = require('botbuilder');

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Ruta para que Azure reciba ping
server.get('/', (req, res, next) => {
  res.send(200, 'Bot is running Maypo TI:'+process.env.MicrosoftAppId c+', ps:'+ process.env.MicrosoftAppPassword);
  return next();
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Bot escuchando en el puerto ${PORT}`);
});
console.log('MicrosoftAppId:', process.env.MicrosoftAppId);
console.log('MicrosoftAppPassword:', process.env.MicrosoftAppPassword ? '*****' : 'No definido');
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId2 ,
  appPassword: process.env.MicrosoftAppPassword2
});

adapter.onTurnError = async (context, error) => {
  console.error('❌ Error en el bot:', error);
  await context.sendActivity('Lo siento, algo salió mal.');
};

server.post('/api/messages', async (req, res) => {
  await adapter.processActivity(req, res, async (context) => {
    if (context.activity.type === 'message') {
      const numero = Math.floor(Math.random() * 100) + 1;
      await context.sendActivity(`👋 ¡Hola! Tu número aleatorio es: ${numero}`);
    }
  });
});
