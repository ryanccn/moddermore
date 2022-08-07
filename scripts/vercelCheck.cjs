const shouldDeploy = () => {
  console.log('Should deploy!');
  process.exit(1);
};

const shouldntDeploy = () => {
  console.log("Shouldn't deploy!");
  process.exit(0);
};

if (process.env.VERCEL_ENV !== 'production') {
  shouldntDeploy();
}

if (
  process.env.VERCEL_GIT_COMMIT_MESSAGE &&
  process.env.VERCEL_GIT_COMMIT_MESSAGE.includes('[skip ci]')
) {
  shouldntDeploy();
}

shouldDeploy();
