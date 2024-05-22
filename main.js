// import { initializeApp } from "firebase/app";
// import { getRemoteConfig } from "firebase/remote-config";

async function main() {
  // await createHttpTaskWithToken()
  await fetchFirebaseRemoteConfig()

  return
}

async function createHttpTaskWithToken(
  project = process.env.PROJECT_ID, // Your GCP Project id
  queue = process.env.QUEUE_NAME, // Name of your Queue
  location = process.env.QUEUE_LOCATION, // The GCP region of your queue
  url = "https://example.com/taskhandler", // The full url path that the request will be sent to
  email = process.env.EMAIL, // Cloud IAM service account
  payload = "Hello, World!",
) {
    // Imports the Google Cloud Tasks library.
    const {v2beta3} = require('@google-cloud/tasks');

    // Instantiates a client.
    const client = new v2beta3.CloudTasksClient();

    // Construct the fully qualified queue name.
    const parent = client.queuePath(project, location, queue);

    // Convert message to buffer.
    const convertedPayload = JSON.stringify(payload);
    const body = Buffer.from(convertedPayload).toString('base64');
  
    const task = {
      httpRequest: {
        httpMethod: 'POST',
        url,
        oidcToken: {
          serviceAccountEmail: email,
          audience: url,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      },
    };

    const currentDate = new Date()
    const executionDate = new Date()
    executionDate.setDate(executionDate.getDate() + 1)

    const dateDiffInSeconds = (executionDate - currentDate) / 1000
    const dateInSeconds = dateDiffInSeconds + Date.now() / 1000

    task.scheduleTime = {
      seconds: dateInSeconds
    }

    try {
      // Send create task request.
      const [response] = await client.createTask({parent, task});
      console.log(`Created task ${response.name}`);
      return response.name;
    } catch (error) {
      // Construct error for Stackdriver Error Reporting
      console.error(Error(error.message));
    }
}

async function fetchFirebaseRemoteConfig() {
  const GOOGLE_APPLICATION_CREDENTIALS = "last-8eea6-firebase-adminsdk-hvhk1-8587cca1c7.json" // firebase credentials private key
  const admin = require("firebase-admin")
  const fs = require("fs")
  const file = fs.readFileSync(GOOGLE_APPLICATION_CREDENTIALS)

  const serviceAccount = JSON.parse(file)
  
  // Initialize Firebase
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const remoteConfig = admin.remoteConfig(app); // get remote config
  const template = await remoteConfig.getTemplate() // access remote config values

  console.log(template.parameterGroups)
  console.log(template.parameterGroups.cms.parameters)
}

main()