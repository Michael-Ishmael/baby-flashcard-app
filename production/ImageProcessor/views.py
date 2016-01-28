#from django.core.files.uploadedfile import UploadedFile
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.shortcuts import render, render_to_response, redirect

# Create your views here.
from django.views.decorators.http import require_POST
import simplejson
#from CompanyCrawler.models import Company
#from delfic_ws.business.data import CsvLoader


from django.http import JsonResponse

def index(request):
    # company_cnt = request.GET.get('top')
    # if not company_cnt:
    #     company_cnt = 20
    # filter = request.GET.get('filter')
    # if filter:
    #     company_list = Company.objects.filter(Name__contains=filter).order_by('Name')[:company_cnt]
    # else:
    #     company_list = Company.objects.order_by('Name')[:company_cnt]
    # j_comps = map(lambda c: c.to_json_obj(), company_list)
    imagelist = { "backlog" :[
        "crit1.png",
        "crit2.png"
    ]}
    try:
        return JsonResponse(imagelist)
    except Exception as ex:
        return JsonResponse({"success": False, "message": ex.message})


    return JsonResponse(j_comps, safe=False)

    # context = {
    #     'testValue': 'bebe',
    # }
    # return render(request, 'imageprocessor/imageprocessing.html', context)


@require_POST
def add_image(request):
    try:
        data = simplejson.loads(request.body)
        if data:
            image_name = data["imagename"]
            result = {"success": True}
        else:
            result = {"success": False, "message": 'No company uploaded'}
    except Exception as ex:
        result = {"success": False, "message": ex.message}
    return JsonResponse(result)



# @require_POST
# def add_company(request):
#     try:
#         data = simplejson.loads(request.body)
#         if data:
#             company = Company()
#             company.Name = data['name']
#             company.RegisteredNumber = data['registerednumber']
#             company.save()
#             result = {"success": True}
#         else:
#             result = {"success": False, "message": 'No company uploaded'}
#     except Exception as ex:
#         result = {"success": False, "message": ex.message}
#     return JsonResponse(result)

