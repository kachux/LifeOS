import git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';

console.log('isomorphic-git loaded successfully!');
console.log('Available git functions:', Object.keys(git).slice(0, 15).join(', '));
