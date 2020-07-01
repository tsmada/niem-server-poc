export const echo = (model) => async (req, res) => {
  if (!req.body) {
    return res.status(500).end();
  }

  const message = req.body;
  const doc = model.validate(message);
  return res.status(200).json(doc);
};

export const crudControllers = (model) => ({
  echo: echo(model),
});
