// 公共字典表
// 用于存放福州地区和设施字典数据

/**
 * 福州地区字典
 * @type {Array<{code: string, name: string, type: string}>}
 */
const FUZHOU_DISTRICTS = [
  { code: '', name: '全部地区', type: 'all' },
  // 五区
  { code: '350102', name: '鼓楼区', type: 'district' },
  { code: '350103', name: '台江区', type: 'district' },
  { code: '350104', name: '仓山区', type: 'district' },
  { code: '350111', name: '晋安区', type: 'district' },
  { code: '350105', name: '马尾区', type: 'district' },
  // 八县
  // { code: '350181', name: '福清市', type: 'county' },
  // { code: '350112', name: '长乐区', type: 'county' },
  { code: '350121', name: '闽侯县', type: 'county' },
  // { code: '350122', name: '连江县', type: 'county' },
  // { code: '350123', name: '罗源县', type: 'county' },
  // { code: '350124', name: '闽清县', type: 'county' },
  // { code: '350125', name: '永泰县', type: 'county' },
  // { code: '350128', name: '平潭县', type: 'county' }
];

/**
 * 设施字典
 * @type {Array<{code: string, name: string, iconPath: string, category: string}>}
 */
const FACILITIES = [
  { code: '1', name: '小程序订场', iconPath: '/images/icons/facilities/app_order.png', category: 'other' },
  // 基础设施
  { code: '10', name: '空调', iconPath: '/images/icons/facilities/air_conditioning.png', category: 'basic' },
  { code: '11', name: '停车场', iconPath: '/images/icons/facilities/parking.png', category: 'basic' },
  { code: '12', name: '储物柜', iconPath: '/images/icons/facilities/locker.png', category: 'basic' },
  { code: '13', name: '淋浴间', iconPath: '/images/icons/facilities/shower.png', category: 'basic' },
  { code: '14', name: '休息区', iconPath: '/images/icons/facilities/rest_area.png', category: 'basic' },
  
  // 专业设施
  { code: '20', name: '拉线服务', iconPath: '/images/icons/facilities/stringing.png', category: 'professional' },
  { code: '21', name: '器材租赁', iconPath: '/images/icons/facilities/equipment_rental.png', category: 'professional' },
  
  // 商业设施
  { code: '30', name: '自动售货机', iconPath: '/images/icons/facilities/vending_machine.png', category: 'commercial' },
  
  // 其他设施
  { code: '40', name: '专业照明', iconPath: '/images/icons/facilities/lighting.png', category: 'other' },
  { code: '41', name: '音响系统', iconPath: '/images/icons/facilities/sound_system.png', category: 'other' },
  { code: '42', name: '医疗急救', iconPath: '/images/icons/facilities/first_aid.png', category: 'other' }
];

/**
 * 羽毛球等级评定标准
 * @type {Array<{level: string, group: string, color: string, description: string}>}
 */
const BADMINTON_RATING_LEVELS = [
  {
    level: '0.5级',
    group: '萌新',
    color: '#6B8DD6',
    description: '室外打球，很少去球馆打；不会正确握拍，苍蝇式握拍法；只能打一些简单高球，打球基本是原地不动；打球不穿运动服，常用的是超市拍子，对球也没有要求。'
  },
  {
    level: '1级',
    group: '娱乐场',
    color: '#6B8DD6',
    description: '会正手和反手握拍，但不会灵活切换；会正手发球和反手发球，但是发的不好，质量较低，场上反应迟钝，经常打不准球，打球不会侧身和架拍；打球会穿运动服。'
  },
  {
    level: '1.5级',
    group: '新手',
    color: '#8BC34A',
    description: '正、反手发球基本及格，但失误较多；打球会侧身但是不到位；场上移动缓慢，反应迟钝，打球动作僵硬，经常打偏打空；正手高远球还是打不好，力量偏弱，经常只能到中半场；网前球还不会下压和扑球。'
  },
  {
    level: '2级',
    group: '养生球',
    color: '#8BC34A',
    description: '正手高远球基本能到底线；打球动作幅度大，还是经常打框，球感略差；场上移动不够灵活，步伐乱，重心不稳，经常不能连接下一拍动作；回球还是直来直去的让对手比较好接；对网前球会有时候下压和放网，但失误率高。'
  },
  {
    level: '2.5级',
    group: '熟手',
    color: '#FF9800',
    description: '发球相对稳定，接发球大多是挑后场，能接后场球；打球大多是平抽和平高球，偶尔会吊球和打斜线，后场还不太会杀球，回球质量不高；能够简单防守但质量不高，常被对手连续进攻。'
  },
  {
    level: '3级',
    group: '小对抗',
    color: '#FF9800',
    description: '发接发比较稳定，接发球不再只是挑后场，会平推或放网等；场上移动相对灵活，反应较快；掌握常用的技术（吊球，杀球，搓球，放网等）；回球也会抓一些空档，回球质量相对可以，正手一般都能回到底线，正反手也能完成一些过度；防守有一定水平，但还不会做出线路主动变化，转守为攻。'
  },
  {
    level: '3.5级',
    group: '老手',
    color: '#F44336',
    description: '掌握常见步伐（踮步、并步、弓箭步、交叉步等），启动和移动速度达到中等水平；反手高远球能够打到后场，正反手过度直线斜线相对稳定；力量和速度达到业余中等水平；进攻有威胁，防守会做出一些路变化，不让对手连续进攻。'
  },
  {
    level: '4级',
    group: '中对抗',
    color: '#F44336',
    description: '发接发质量高，失误少，网前放网、搓球等质量高：前场封网速度快后场能够连续进攻，掌握各种杀球（重杀，劈杀，点杀）和吊球（滑板吊，劈吊）技术；能够较好的完成对抗练习，有控制对手的意识，发现其弱点；场上失误较少，回球质量较高。'
  },
  {
    level: '4.5级',
    group: '高手',
    color: '#9C27B0',
    description: '各种步伐比较标准，没有多余的动作；力量和速度达到中高等水平；进攻和防守能力较强，后场能够连续进攻，甚至会双脚起跳杀球，防守也能做出球路变化，转守为攻；控球能力较强，失误较少，会一些假动作且动作一致性较强。'
  },
  {
    level: '5级',
    group: '大对抗',
    color: '#9C27B0',
    description: '各项技术运用自如，并且有一两项突出的技术（比如杀球快）；单打和双打技术娴熟，每一拍衔接的比较快，几乎没有失误；会一些高难度的动作（如鱼跃接球；身后接球，反手杀球等）：力量和速度达到高等水平，进攻威胁较强，防守也较牢固。'
  },
  {
    level: '6级',
    group: '高手',
    color: '#673AB7',
    description: '各项技术能力较强，明显看到专业选手的技术特点，有一定的技术和战术分析能力；有经常参加业余的各种比赛，并且取得过较好的成绩在当地的某些组织里小有名气。'
  }
];



/**
 * 根据代码获取地区信息
 * @param {string} code - 地区代码
 * @returns {Object|null} 地区信息
 */
function getDistrictByCode(code) {
  return FUZHOU_DISTRICTS.find(district => district.code === code) || null;
}

/**
 * 根据代码获取设施信息
 * @param {string} code - 设施代码
 * @returns {Object|null} 设施信息
 */
function getFacilityByCode(code) {
  return FACILITIES.find(facility => facility.code === code) || null;
}

/**
 * 根据分类获取设施列表
 * @param {string} category - 设施分类
 * @returns {Array} 设施列表
 */
function getFacilitiesByCategory(category) {
  return FACILITIES.filter(facility => facility.category === category);
}

/**
 * 获取羽毛球等级评定数据
 * @returns {Array} 羽毛球等级列表
 */
function getBadmintonRatingLevels() {
  return BADMINTON_RATING_LEVELS;
}

/**
 * 根据等级获取羽毛球等级信息
 * @param {string} level - 等级（如‘3级”）
 * @returns {Object|null} 等级信息
 */
function getBadmintonRatingByLevel(level) {
  return BADMINTON_RATING_LEVELS.find(rating => rating.level === level) || null;
}

/**
 * 根据组别获取羽毛球等级列表
 * @param {string} group - 组别（如“萌新”、“高手”）
 * @returns {Array} 对应组别的等级列表
 */
function getBadmintonRatingsByGroup(group) {
  return BADMINTON_RATING_LEVELS.filter(rating => rating.group === group);
}

// 导出字典数据和工具函数
module.exports = {
  // 字典数据
  FUZHOU_DISTRICTS,
  FACILITIES,
  BADMINTON_RATING_LEVELS,
  
  // 工具函数
  getDistrictByCode,
  getFacilityByCode,
  getFacilitiesByCategory,
  getBadmintonRatingLevels,
  getBadmintonRatingByLevel,
  getBadmintonRatingsByGroup
};