import { NodeTypes } from "./ast";
import { helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";

export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;

  genFunctionPreamble(ast, context);

  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");

  push(`function ${functionName} (${signature}){`);
  genNode(ast.codegenNode, context);
  push("}");

  return {
    code: context.code,
  };
}
// 导入部分代码生成
function genFunctionPreamble(ast, context) {
  const { push, helper } = context;
  const VueBinging = "Vue";
  const aliasHelper = (s) => `${helperMapName[s]}:${helper(s)}`;
  if (ast.helpers.length) {
    push(`const { ${ast.helpers.map(aliasHelper).join(", ")}} = ${VueBinging}`);
  }
  push(`\n`);
  push("return ");
}
function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  };
  return context;
}

function genNode(node: any, context: any) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    default:
      break;
  }
}
// 处理 string
function genText(node, context) {
  const { push } = context;
  push(`return '${node.content}'`);
}
// 处理 插值
function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(`return ${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(`)`);
}
// 处理 表达式
function genExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}