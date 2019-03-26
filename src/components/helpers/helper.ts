import * as _ from 'underscore';

const NO_JWT_PRESENT_OR_HAS_EXPIRED = 'No JWT present or has expired';

export function jwtError(error): boolean {
  return (error.message === NO_JWT_PRESENT_OR_HAS_EXPIRED) || (error === NO_JWT_PRESENT_OR_HAS_EXPIRED);
}


declare var urlsServerConfig: any;
export const baseUrl: string = urlsServerConfig.protocol + '://' + urlsServerConfig.url + urlsServerConfig.port;


export function printResponse(response) {
  console.log(response.json());
  return response;
}

export class Caster {
  static castArray<T>(base: any, json: any): T[] {
    if (_.isArray(json)) {
      return json.map((obj) => {
        return _.extend(new base(), obj);
      });
    } else {
      throw new Error('Expecting an Array');
    }
  }

  static cast<T>(base: any, json: any): T {
    if (_.isArray(json)) {
      throw new Error('Expecting an Object');
    } else {
      return _.extend(new base(), json);
    }
  }
}


export const Colors = [
    {name:"aqua", color:"#00ffff"},
    {name:"azure", color:"#f0ffff"},
    {name:"beige", color:"#f5f5dc"},
    {name:"black", color:"#000000"},
    {name:"blue", color:"#0000ff"},
    {name:"brown", color:"#a52a2a"},
    {name:"cyan", color:"#00ffff"},
    {name:"darkblue", color:"#00008b"},
    {name:"darkcyan", color:"#008b8b"},
    {name:"darkgrey", color:"#a9a9a9"},
    {name:"darkgreen", color:"#006400"},
    {name:"darkkhaki", color:"#bdb76b"},
    {name:"darkmagenta", color:"#8b008b"},
    {name:"darkolivegreen", color:"#556b2f"},
    {name:"darkorange", color:"#ff8c00"},
    {name:"darkorchid", color:"#9932cc"},
    {name:"darkred", color:"#8b0000"},
    {name:"darksalmon", color:"#e9967a"},
    {name:"darkviolet", color:"#9400d3"},
    {name:"fuchsia", color:"#ff00ff"},
    {name:"gold", color:"#ffd700"},
    {name:"green", color:"#008000"},
    {name:"indigo", color:"#4b0082"},
    {name:"khaki", color:"#f0e68c"},
    {name:"lightblue", color:"#add8e6"},
    {name:"lightcyan", color:"#e0ffff"},
    {name:"lightgreen", color:"#90ee90"},
    {name:"lightgrey", color:"#d3d3d3"},
    {name:"lightpink", color:"#ffb6c1"},
    {name:"lightyellow", color:"#ffffe0"},
    {name:"lime", color:"#00ff00"},
    {name:"magenta", color:"#ff00ff"},
    {name:"maroon", color:"#800000"},
    {name:"navy", color:"#000080"},
    {name:"olive", color:"#808000"},
    {name:"orange", color:"#ffa500"},
    {name:"pink", color:"#ffc0cb"},
    {name:"purple", color:"#800080"},
    {name:"violet", color:"#800080"},
    {name:"red", color:"#ff0000"},
    {name:"silver", color:"#c0c0c0"},
    {name:"yellow", color:"#ffff00"}
];
