const core = require('@actions/core');
const github = require('@actions/github');
const { IncomingMessage } = require('http');
const https = require('https')

try {
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;

  let tag = core.getInput('tag');
  if (tag === "") {
    const ref = github.context.ref
    tag = ref.substring(ref.lastIndexOf('/') + 1)
    console.log(`No tag given, using '${tag}'.`);
  }

  let repository = core.getInput('repository');
  if (repository === "") {
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    repository = `${owner}/${repo}`
    console.log(`No repository given, using '${repository}'.`)
  }

  let requestCall = new Promise((resolve, reject) => {
    let responseBody = '';

    const options = {
      hostname: 'pkg.toit.io',
      port: 443,
      path: `/api/v1/register/github.com/${repository}/version/${tag}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0
      }
    }

    const req = https.request(options, res => {
      res.on('error', error => {
        reject(error);
      });

      res.on('data', chunk => {
        responseBody += chunk;
      });

      res.on('end', () => {
        res.body = responseBody;
        resolve(res);
      });

      resolve(res);
    });

    req.on('error', error => {
      reject(error)
    });

    req.end();
  });

  requestCall.then((response) => {
    if (response.statusCode === 200) {
      console.log("Package published.");
    } else {
      console.log("Failed to publish package.");
      let bodyMessage = ""
      if (response.body) {
        try {
          bodyMessage = JSON.parse(response.body).message;
        } catch (error) {
          bodyMessage = response.body;
        }
      }
      const errorMessage = bodyMessage !== "" ? bodyMessage : response.statusMessage;
      const serverResponse = `${response.statusCode}: ${errorMessage}`;
      console.log(serverResponse);
      core.setFailed(serverResponse);
    }
  }).catch((error) => {
    console.log(error);
    core.setFailed(error.message);
  });

} catch (error) {
  core.setFailed(error.message);
}
