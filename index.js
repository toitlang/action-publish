const core = require('@actions/core');
const github = require('@actions/github');
const { IncomingMessage } = require('http');
const https = require('https')

try {
  const input_options = {
    required: true,
    trimWhitespace: true,
  };

  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;

  let tag = core.getInput('tag');
  if (tag === "") {
    const ref = github.context.ref
    tag = ref.substr(ref.lastIndexOf('/') + 1)
    console.log(`No tag given, using '${tag}'.`);
  }

  let repository = core.getInput('repository');
  if (repository === "") {
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    repository = `${owner}/${repo}`
    console.log(`No repository given, using '${repository}'.`)
  }

  let request_call = new Promise((resolve, reject) => {
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

      resolve(res);
    });

    req.on('error', error => {
      reject(error)
    });

    req.end();
  });

  request_call.then((response) => {
    if (response.statusCode === 200) {
      console.log("Package published.");
    } else {
      console.log("Failed to publish message.");
      const server_response = `${response.statusCode}: ${response.statusMessage}`;
      console.log(server_response);
      core.setFailed(server_response);
    }
  }).catch((error) => {
    console.log(error);
    core.setFailed(error.message);
  });

} catch (error) {
  core.setFailed(error.message);
}
