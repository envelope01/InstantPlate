const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;
  const result = await authService.signup(email, password, role);

  res.status(201).json({
    status: 'success',
    token: result.token,
    data: {
      user: result.user
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.status(200).json({
    status: 'success',
    token: result.token,
    data: {
      user: result.user
    }
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await authService.getMe(req.user.id);
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});
