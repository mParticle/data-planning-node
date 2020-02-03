export const config = {
    apiRoot: 'https://api.mparticle.com',
    dataPlanningPath: 'planning/v1',

    auth: {
        url: 'https://sso.auth.mparticle.com/oauth/token',
        apiRoot: 'https://sso.auth.mparticle.com',
        path: 'oauth/token',
        audienceUrl: 'https://api.mparticle.com',
        grant_type: 'client_credentials',
    },
};
