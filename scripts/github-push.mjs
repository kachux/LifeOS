#!/usr/bin/env node
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import readline from 'readline';

async function promptToken() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question('\nEnter your GitHub Personal Access Token (classic with repo scope or fine-grained): ', (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function run() {
  const dir = process.cwd();
  console.log('====================================================');
  console.log('LifeOS GitHub Push Utility');
  console.log('Target: https://github.com/kasimraheeskzr/LifeOS.git');
  console.log('Branch: main');
  console.log('====================================================');

  let token = process.argv[2] || process.env.GITHUB_TOKEN;
  if (!token) {
    token = await promptToken();
  }

  if (!token) {
    console.error('Error: No GitHub token provided.');
    console.log('Usage: node scripts/github-push.mjs <GITHUB_TOKEN>');
    console.log('Or set $env:GITHUB_TOKEN="your_token"');
    process.exit(1);
  }

  console.log('\nConnecting to GitHub and pushing commits...');

  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      force: false,
      onAuth: () => ({
        username: token,
        password: ''
      })
    });

    console.log('\n Push successful!');
    console.log('Push details:', JSON.stringify(pushResult, null, 2));
    console.log('\nView your repository online at:');
    console.log('https://github.com/kasimraheeskzr/LifeOS\n');
  } catch (err) {
    if (err.data && err.data.statusCode === 401) {
      console.error('\n Authentication failed (401 Unauthorized).');
      console.error('Please verify your Personal Access Token has "repo" permissions.');
      console.error('Generate a token at: https://github.com/settings/tokens (select "repo" scope).');
    } else if (err.message && err.message.includes('fetch first')) {
      console.log('\nRemote contains commits. Retrying with force push or pull...');
      try {
        await git.push({
          fs,
          http,
          dir,
          remote: 'origin',
          ref: 'main',
          force: true,
          onAuth: () => ({
            username: token,
            password: ''
          })
        });
        console.log('\n Push successful (forced update to main)!');
        console.log('https://github.com/kasimraheeskzr/LifeOS\n');
      } catch (forceErr) {
        console.error('Push error:', forceErr.message);
      }
    } else {
      console.error('\nPush failed:', err.message || err);
    }
  }
}

run();
