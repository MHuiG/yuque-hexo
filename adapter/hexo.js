'use strict';

const ejs = require('ejs');
const Entities = require('html-entities').AllHtmlEntities;
const FrontMatter = require('hexo-front-matter');
const { formatDate, formatRaw, formatTags } = require('../util');

const entities = new Entities();

// 文章模板
const template = `
---
<% for (const key in props) {%>
<%= key %>: <%= props[key] %>
<% } %>
---
<%- raw %>
`;

/**
 * front matter 反序列化
 * @description
 * docs: https://www.npmjs.com/package/hexo-front-matter
 *
 * @param {String} body md 文档
 * @return {String} result
 */
function parseMatter(body) {
  body = entities.decode(body);
  try {
    // front matter信息的<br/>换成 \n
    const regex = /(title:|layout:|tags:|date:|categories:|comments:|top:|abstract:|message:|password:|sage:|abbrlink:|){1}(\S|\s)+?---/gi;
    body = body.replace(regex, a => a.replace(/(<br \/>|<br>|<br\/>)/gi, '\n'));
    const result = FrontMatter.parse(body);
    result.body = result._content;
    if (result.date) {
      result.date = formatDate(result.date);
    }
    delete result._content;
    return result;
  } catch (error) {
	console.log(error);
    /*return {
      body,
    };*/
  }
}


/**
 * hexo 文章生产适配器
 *
 * @param {Object} post 文章
 * @return {String} text
 */
module.exports = function(post) {
  // matter 解析
  const parseRet = parseMatter(post.body);
  //console.log(parseRet);
  const { body, ...data } = parseRet;
  const { title, slug: urlname, created_at } = post;
  const raw = formatRaw(body);
  const date = data.date || formatDate(created_at);
  const tags = data.tags || [];
  const categories = data.categories || [];
  const top=data.top || false;
  const sage=data.sage || false;
  const abbrlink = data.abbrlink || '';
  var abstract='Something was encrypted, please enter password to read.';
  var message='Welcome to my blog, enter password to read.';
  var comments=true;
  if(data.comments!=comments){
	  comments=data.comments;
  };
  if(data.abstract){
	  abstract=data.abstract;
  };
  if(data.message){
	  message=data.message;
  };
  const props = {
    title: title.replace(/"/g, ''), // 临时去掉标题中的引号，至少保证文章页面是正常可访问的
    date,
	...data,
	abstract,
	message,
	tags: formatTags(tags),
    categories: formatTags(categories),
	comments,
	top,
	sage,
	abbrlink,
  };
  const text = ejs.render(template, {
    raw,
    props,
  });
  return text;
};
