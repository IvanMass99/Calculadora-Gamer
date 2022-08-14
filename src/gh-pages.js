var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/IvanMass99/Calculadora-Gamer', // Update to point to your repository  
        user: {
            name: 'IvanMass99', // update to use your name
            email: 'ivaanmass@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)