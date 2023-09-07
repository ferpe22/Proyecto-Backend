const openSession = (req, res, next) => {
    if(req.user) {
        return res.redirect('/profile')
    } else {
        return next()
    }
}

const needLogin = (req, res, next) => {
    if(!req.user) {
        return res.redirect('/')
    } else {
        return next()
    }
}

const requireAdmin = (req, res, next) => {
    if(req.user.role !== 'Admin') {
        return res.redirect('/')
    } else {
        return next()
    }
}

module.exports = { openSession, needLogin, requireAdmin }
