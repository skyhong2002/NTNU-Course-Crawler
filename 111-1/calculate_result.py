import json
import pandas as pd

courses = pd.read_csv('GU_EU.csv')

gongguan_weight = 0
main_campus_weight = 0
outta_school_weight = 0
heping_weight = 0
not_defined_weight = 0

for i in range(len(courses)):
    course = courses.iloc[i]
    # course['credit'] * course['quota']
    weight = course['credit'] * course['quota']
    # print(course['quota'], end = ' ')
    if(course['campus'] == '本部'):
        main_campus_weight += weight
    elif(course['campus'] == '公館'):
        gongguan_weight += weight
    elif(course['campus'] == '校外'):
        outta_school_weight += weight
    elif(course['campus'] == '和平'):
        heping_weight += weight
    else:
        not_defined_weight += weight

print('台師大課程校區分佈：（師培、通識）')
print('(單位：學分*名額)')
print('公館：', gongguan_weight)
print('本部：', main_campus_weight)
print('校外：', outta_school_weight)
print('未知：', not_defined_weight)
