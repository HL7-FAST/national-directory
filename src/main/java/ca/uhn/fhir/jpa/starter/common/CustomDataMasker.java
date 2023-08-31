package ca.uhn.fhir.jpa.starter.common;

import java.util.List;
import java.util.Iterator;

import org.hibernate.annotations.common.reflection.MetadataProvider;
import org.hl7.fhir.instance.model.api.IBaseConformance;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.hl7.fhir.r4.model.CapabilityStatement;
import org.hl7.fhir.r4.model.DateTimeType;
//import org.hl7.fhir.r4.model.Extension;
//import org.hl7.fhir.r4.model.Patient;
//import org.hl7.fhir.r4.model.StringType;
//import org.springframework.stereotype.Component;
import org.hl7.fhir.r4.model.Extension;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Bundle.BundleEntryComponent;
import org.hl7.fhir.r4.model.StringType;
import org.hl7.fhir.r4.model.Coding;

import ca.uhn.fhir.interceptor.api.Hook;
import ca.uhn.fhir.interceptor.api.Interceptor;
import ca.uhn.fhir.interceptor.api.Pointcut;
import ca.uhn.fhir.rest.api.RestOperationTypeEnum;
import ca.uhn.fhir.rest.server.servlet.ServletRequestDetails;

import ca.uhn.fhir.rest.api.server.RequestDetails;
import ca.uhn.fhir.rest.api.server.ResponseDetails;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;




// HAPI Pointcut descriptions - https://hapifhir.io/hapi-fhir/apidocs/hapi-fhir-base/ca/uhn/fhir/interceptor/api/Pointcut.html

@Interceptor
public class CustomDataMasker {
	private final Logger myLogger = LoggerFactory.getLogger(CustomDataMasker.class.getName());

	/*
	SERVER_OUTGOING_RESPONSE
	public static final Pointcut SERVER_OUTGOING_RESPONSE
	Server Hook: This method is called after the server implementation method has been called, but before any attempt to stream the response back to the client. Interceptors may examine or modify the response before it is returned, or even prevent the response.
	Hooks may accept the following parameters:

	ca.uhn.fhir.rest.api.server.RequestDetails - A bean containing details about the request that is about to be processed, including details such as the resource type and logical ID (if any) and other FHIR-specific aspects of the request which have been pulled out of the servlet request.
	ca.uhn.fhir.rest.server.servlet.ServletRequestDetails - A bean containing details about the request that is about to be processed, including details such as the resource type and logical ID (if any) and other FHIR-specific aspects of the request which have been pulled out of the servlet request. This parameter is identical to the RequestDetails parameter above but will only be populated when operating in a RestfulServer implementation. It is provided as a convenience.
	org.hl7.fhir.instance.model.api.IBaseResource - The resource that will be returned. This parameter may be null for some responses.
	ca.uhn.fhir.rest.api.server.ResponseDetails - This object contains details about the response, including the contents. Hook methods may modify this object to change or replace the response.
	javax.servlet.http.HttpServletRequest - The servlet request, when running in a servlet environment
	javax.servlet.http.HttpServletResponse - The servlet response, when running in a servlet environment
	Hook methods may return true or void if processing should continue normally. This is generally the right thing to do. If your interceptor is providing a response rather than letting HAPI handle the response normally, you must return false. In this case, no further processing will occur and no further interceptors will be called.

	Hook methods may also throw AuthenticationException to indicate that the interceptor has detected an unauthorized access attempt. If thrown, processing will stop and an HTTP 401 will be returned to the client.
	 * 
	 */

	@Hook(Pointcut.SERVER_OUTGOING_RESPONSE)
   public void maskUnattested(RequestDetails requestDetails, ServletRequestDetails servletRequestDetails, IBaseResource resource, ResponseDetails responseDetails, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
		
		String purpose = httpRequest.getHeader("X-Purpose");
		if(purpose == null || purpose.trim().isEmpty())
		{
			purpose = "other";
		}
		if (resource instanceof Bundle && !purpose.equals("attestation")) {
			Bundle bundle = (Bundle) resource;
			
			int total = bundle.getTotal();
			

			List<BundleEntryComponent> entries = bundle.getEntry();
			Iterator<BundleEntryComponent> i = entries.iterator();
			while (i.hasNext()) 
			{
				BundleEntryComponent entry = i.next(); // must be called before you can call i.remove()
				
				
				boolean maskEntry = false;

				
				for(Coding coding : entry.getResource().getMeta().getSecurity())
				{
					myLogger.info("Confidentiality: " + coding.getCode() + " : " + coding.getSystem() + " : " + entry.getFullUrlElement().toString());
					if(coding.getCode().equals("V") && coding.getSystem().equals("http://terminology.hl7.org/CodeSystem/v3-Confidentiality"))
					{
						maskEntry = true;
						break;
					}
				}
				if(maskEntry)
				{
					myLogger.info("Removing Masked Resource: " + entry.getFullUrlElement().toString());
					i.remove();
					//bundle.getEntryFirstRep().
					total--;
				}
				else
				{
					myLogger.info("Resource is not masked: " + entry.getFullUrlElement().toString());
					//bundle.getEntryFirstRep().
				}
				bundle.setTotal(total);

				
			}
/*
			for( BundleEntryComponent entry : bundle.getEntry())
			{
				boolean maskEntry = false;

				
				for(Coding coding : entry.getResource().getMeta().getSecurity())
				{
					myLogger.info("Confidentiality: " + coding.getCode() + " : " + coding.getSystem() + " : " + entry.getFullUrlElement().toString());
					if(coding.getCode().equals("V") && coding.getSystem().equals("http://terminology.hl7.org/CodeSystem/v3-Confidentiality"))
					{
						maskEntry = true;
						break;
					}
				}
				if(maskEntry)
				{
					myLogger.info("Removing Masked Resource: " + entry.getFullUrlElement().toString());
					//bundle.getEntryFirstRep().
					total--;
				}
				else
				{
					myLogger.info("Resource is not masked: " + entry.getFullUrlElement().toString());
					//bundle.getEntryFirstRep().
				}
				bundle.setTotal(total);
				//BundleEntryComponent myEntry = (BundleEntryComponent) entry;
				
			}
			*/
			//Extension ext = pat.addExtension();
			//ext.setUrl("http://some.custom.pkg1/CustomInterceptorPojo");
			//ext.setValue(new StringType("CustomInterceptorPojo wuz here"));
		}
	}

	/* Pointcut.STORAGE_PREACCESS_RESOURCES
	 	Storage Hook: Invoked when one or more resources may be returned to the user, whether as a part of a READ, a SEARCH, or even as the response to a CREATE/UPDATE, etc.
		This hook is invoked when a resource has been loaded by the storage engine and is being returned to the HTTP stack for response. This is not a guarantee that the client will ultimately see it, since filters/headers/etc may affect what is returned but if a resource is loaded it is likely to be used. Note also that caching may affect whether this pointcut is invoked.

		Hooks will have access to the contents of the resource being returned and may choose to make modifications. These changes will be reflected in returned resource but have no effect on storage.

		Hooks may accept the following parameters:
		ca.uhn.fhir.rest.api.server.IPreResourceAccessDetails - Contains details about the specific resources being returned.
		ca.uhn.fhir.rest.api.server.RequestDetails - A bean containing details about the request that is about to be processed, including details such as the resource type and logical ID (if any) and other FHIR-specific aspects of the request which have been pulled out of the servlet request. Note that the bean properties are not all guaranteed to be populated, depending on how early during processing the exception occurred. Note that this parameter may be null in contexts where the request is not known, such as while processing searches
		ca.uhn.fhir.rest.server.servlet.ServletRequestDetails - A bean containing details about the request that is about to be processed, including details such as the resource type and logical ID (if any) and other FHIR-specific aspects of the request which have been pulled out of the servlet request. This parameter is identical to the RequestDetails parameter above but will only be populated when operating in a RestfulServer implementation. It is provided as a convenience.
		Hooks should return void
	 */



	/* STORAGE_PRESHOW_RESOURCES
		Storage Hook: Invoked when one or more resources may be returned to the user, whether as a part of a READ, a SEARCH, or even as the response to a CREATE/UPDATE, etc.
		This hook is invoked when a resource has been loaded by the storage engine and is being returned to the HTTP stack for response. This is not a guarantee that the client will ultimately see it, since filters/headers/etc may affect what is returned but if a resource is loaded it is likely to be used. Note also that caching may affect whether this pointcut is invoked.

		Hooks will have access to the contents of the resource being returned and may choose to make modifications. These changes will be reflected in returned resource but have no effect on storage.

		Hooks may accept the following parameters:
		ca.uhn.fhir.rest.api.server.IPreResourceShowDetails - Contains the resources that will be shown to the user. This object may be manipulated in order to modify the actual resources being shown to the user (e.g. for masking)
		ca.uhn.fhir.rest.api.server.RequestDetails - A bean containing details about the request that is about to be processed, including details such as the resource type and logical ID (if any) and other FHIR-specific aspects of the request which have been pulled out of the servlet request. Note that the bean properties are not all guaranteed to be populated, depending on how early during processing the exception occurred. Note that this parameter may be null in contexts where the request is not known, such as while processing searches
		ca.uhn.fhir.rest.server.servlet.ServletRequestDetails - A bean containing details about the request that is about to be processed, including details such as the resource type and logical ID (if any) and other FHIR-specific aspects of the request which have been pulled out of the servlet request. This parameter is identical to the RequestDetails parameter above but will only be populated when operating in a RestfulServer implementation. It is provided as a convenience.
		Hooks should return void.
	 */

	 // SERVER_INCOMING_REQUEST_PRE_PROCESSED Could use this one to change the request



}
