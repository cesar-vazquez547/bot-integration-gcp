const restify = require('restify');
const { BotFrameworkAdapter } = require('botbuilder');

// Crear servidor
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`✅ Bot escuchando en ${server.url}`);
});

// Adapter sin credenciales (útil local o configurado por variables de entorno en Azure)
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId || '',
  appPassword: process.env.MicrosoftAppPassword || ''
});

// Manejo de errores global
adapter.onTurnError = async (context, error) => {
  console.error('❌ Error en el bot:', error);
  await context.sendActivity('Lo siento, algo salió mal.');
};

// Manejo de mensajes
server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async context => {
    if (context.activity.type === 'message') {
      const numero = Math.floor(Math.random() * 100) + 1;
      await context.sendActivity(`👋 ¡Hola! Tu número aleatorio es: ${numero}`);
    }
  });
});
