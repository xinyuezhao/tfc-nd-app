export const checkForTernary = (condition, ifBlock, elseBlock) => {
  return condition ? ifBlock : elseBlock;
};

export const checkComponentRender = (condition, component) => {
  return condition ? component : "";
};
