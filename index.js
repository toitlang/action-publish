const core = require('@actions/core');
const github = require('@actions/github');
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
      console.log(`statusCode: ${res.statusCode}`)

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
    console.log(response);
  }).catch((error) => {
    console.log(error);
    core.setFailed(error.message);
  });

} catch (error) {
  core.setFailed(error.message);
}
