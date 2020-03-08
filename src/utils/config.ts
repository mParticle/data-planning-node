export const config = {
    apiRoot: 'https://api.mparticle.com',
    dataPlanningPath: 'platform/v2/workspaces',

    auth: {
        url: 'https://sso.auth.mparticle.com/oauth/token',
        apiRoot: 'https://sso.auth.mparticle.com',
        path: 'oauth/token',
        audienceUrl: 'https://api.mparticle.com',
        grant_type: 'client_credentials',
    },
};
