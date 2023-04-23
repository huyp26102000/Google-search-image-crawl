import CMDKey from "./config.js";

const isCommand = async (input, condition) => {
  return condition.every((v) => input.includes(v));
};

const logHelp = async () => {
  console.log(`\n\t**************************************************************
  \t*                                                            *
  \t*            --- Google Image Crawler ---           *
  \t*                                                            *
  \t**************************************************************`)
  console.log('\x1b[36m%s\x1b[0m', '\nUSAGE:  node index.js [-option]')
  console.log('\tOption with color:')
  console.log('\x1b[32m%s\x1b[0m', '\t\tgreen:   ', 'feature ready')
  console.log('\x1b[33m%s\x1b[0m', '\t\tyellow:  ', 'feature not ready')

  console.log('\nCrawl data with keyword')
  console.log('\x1b[32m%s\x1b[0m', '\t-crawl "key word"')
  console.log('Monitor crawl result')
  console.log('\x1b[32m%s\x1b[0m', '\t-monitor')
  console.log('Work with database')
  console.log('\x1b[33m%s\x1b[0m', '\t-database -clear:              ', 'clean database')
  console.log('\x1b[33m%s\x1b[0m', '\t-database -filter -duplicate:  ', 'remove duplicate result')
  console.log('Download')
  console.log('\x1b[33m%s\x1b[0m', '\t-download "path/to/location"')
  console.log('Help')
  console.log('\x1b[32m%s\x1b[0m', '\t-help')
  console.log('Filter')
  console.log('\x1b[32m%s\x1b[0m', '\t-filter -duplicate -content')
}
export default { isCommand, logHelp, CMDKey };