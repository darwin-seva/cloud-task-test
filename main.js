async function main() {
  await createHttpTaskWithToken()

  return
}

async function createHttpTaskWithToken(
  project = "quickstart-1578540830781", // Your GCP Project id
  queue = "testing-queue-scheduler", // Name of your Queue
  location = "asia-southeast2", // The GCP region of your queue
  url = "https://example.com/taskhandler", // The full url path that the request will be sent to
  email = "arntonius@quickstart-1578540830781.iam.gserviceaccount.com", // Cloud IAM service account
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

main()