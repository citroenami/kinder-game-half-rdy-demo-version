export const scenes = [
  {
    sceneNum: 1,
    sceneName : 'map-scene',
    chars_participating : [3,4,5,6,7,8,9,10],
    sceneContainerCharacter : 3,
    areaContainerCharacter : [5,6,7],
    fieldContainerCharacter : [4,8,9,10]
  },
  {
    sceneNum: 2,
    sceneName: 'main-scene',
    chars_participating : [1,4,10,11,12,13,14,15,16,17,18,21,31],
    sceneContainerCharacter : 11,
    areaContainerCharacter : [4,12,13,14,21],
    fieldContainerCharacter : [1,10],
    relevant_chars_shop_inside : [11,21],
    school_area_items : [1,2,3]
  },
  {
    sceneNum: 3,
    sceneName: 'sub-scene',
    // had to include 11 coz of function logic..
    // had to add extra properties due to poor initial design
    chars_participating : [1,2,10,11,13,22,23,25,26,27,29,30,31,32],
    sceneContainerCharacter : 11,
    areaContainerCharacter : [13,33],
    aeriaCharacter: [1,10],
    // this fieldContainerCharacter is different from
    // previous. its just a list of chars present in scene
    fieldContainerCharacter : [26,32],
    actor_chars: [2,22,23,25,27,29,30,31,32]
  },
  {
    sceneNum: 4,
    sceneName: 'action-scene',
    chars_participating : [2,11,22,23,25,26,27,29,30,32,34],
    sceneContainerCharacter : 11,
    areaContainerCharacter : [13,33],
    aeriaCharacter: [1,10],
    // this fieldContainerCharacter is different from
    // previous. its just a list of chars present in scene
    fieldContainerCharacter : [26,32],
    actor_chars_story : [2,25,27,34],
    actor_chars_result : [22,23,24,29,30]
  }
];