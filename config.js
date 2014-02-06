module.exports = {
    env: {
          use: "production"
        , development:  { 
                port: 33840
        }
        , production: { 
                port: 33841
        }
    },
    mongo: {
          ip: "localhost"
        , db: "developersguild"
    },
    fs: {
          publicDir: "/public"
        , clientDir: "/client"
        , scss: "/scss"
    }
}