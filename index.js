const restify = require('restify');
const { BotFrameworkAdapter } = require('botbuilder');
const axios = require('axios'); // 1. Importar axios
const appInsights = require("applicationinsights");
appInsights.setup().setInternalLogging(true, true).setAutoDependencyCorrelation(true).setAutoCollectRequests(true).setAutoCollectPerformance(true).setAutoCollectExceptions(true).setAutoCollectDependencies(true).setAutoCollectConsole(true).setUseDiskRetryCaching(true).start();
const client = appInsights.defaultClient;

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Ruta para que Azure reciba ping
server.get('/', (req, res, next) => {
  
  res.send(200, 'ajale home');
  return next();
});
// Ruta para que Azure reciba ping
server.get('/log', (req, res, next) => {
  const message = 'Bot is running Maypo';

  try {
    if (client) {
      client.trackTrace({ message });
    } else {
      console.warn('⚠️ Application Insights no está inicializado.'+process.env.APPINSIGHTS_INSTRUMENTATIONKEY);
    }
    res.send(200, message);
  } catch (err) {
    console.error('❌ Error al registrar en Application Insights:'+process.env.APPINSIGHTS_INSTRUMENTATIONKEY+' : ', err);
    res.send(500, 'Error interno');
  }

  return next();
});
/*server.get('/pruebaerror', (req, res, next) => {
  res.status(403).send('Acceso prohibido');
   return next();
});*/
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Bot escuchando en el puerto ${PORT}`);
});


//console.log('MicrosoftAppId:', process.env.MicrosoftAppId);
//console.log('MicrosoftAppPassword:', process.env.MicrosoftAppPassword ? '*****' : 'No definido');

const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId2,
  appPassword: process.env.MicrosoftAppPassword2
});

adapter.onTurnError = async (context, error) => {
  console.error('❌ Error en el bot:', error);
  await context.sendActivity('Lo siento, algo salió mal.');
};

// --- LÓGICA PRINCIPAL MODIFICADA ---
server.post('/api/messages', async (req, res) => {
  await adapter.processActivity(req, res, async (context) => {
    if (context.activity.type === 'message' && context.activity.text) {
      
      // Muestra un indicador de que el bot está "escribiendo"
      await context.sendActivity({ type: 'typing' });

      // 2. Define la URL del API y prepara los datos
      const apiUrl = "https://ipps-api-957181844834.us-central1.run.app/ask";
      const userQuestion = context.activity.text; // Obtiene el mensaje del usuario
      const payload = {
        question: userQuestion,
        user_id: context.activity.from.id || "usuario_demo" // Usa el ID del usuario o uno de demo
      };

      try {
        // 3. Realiza la petición POST al API con axios
        const response = await axios.post(apiUrl, payload);

        // 4. Extrae la respuesta del API y envíala al usuario
        if (response.data && response.data.response) {
          const apiResponse = response.data.response;
          await context.sendActivity(apiResponse);
        } else {
          await context.sendActivity("No obtuve una respuesta válida del servicio.");
        }

      } catch (error) {
        // 5. Maneja posibles errores en la llamada al API
        console.error('❌ Error al llamar al API externo:', error.message);
        await context.sendActivity('Lo siento, tuve problemas para conectarme con el servicio de información.');
      }

    }
  });
});
