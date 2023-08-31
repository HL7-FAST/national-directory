package ca.uhn.fhir.jpa.starter.common;

import java.io.*;
import org.hl7.fhir.instance.model.api.IBaseConformance;
import org.hl7.fhir.r4.model.CapabilityStatement;

import ca.uhn.fhir.parser.IParser;

import org.slf4j.LoggerFactory;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.interceptor.api.Hook;
import ca.uhn.fhir.interceptor.api.Interceptor;
import ca.uhn.fhir.interceptor.api.Pointcut;



// Will need to support different CapabilityStatement per endpoint open/fhir(secure)
@Interceptor
public class CapabilityStatementCustomizer {
	
	private final String attestationCSFilename = "Attestation_CapabilityStatement.json";
	private final org.slf4j.Logger myLogger = LoggerFactory.getLogger(CapabilityStatementCustomizer.class.getName());
	private IParser jparser;

   @Hook(Pointcut.SERVER_CAPABILITY_STATEMENT_GENERATED)
   public IBaseConformance customize(IBaseConformance theCapabilityStatement) {

		//ServerCapabilityStatementProvider.getServerConformance()
      // Cast to the appropriate version

		IBaseConformance cs = loadCapabilityStatement(attestationCSFilename);
		if(cs != null)
		{
			theCapabilityStatement = cs;
		}
		
		return (CapabilityStatement) theCapabilityStatement;
   }

	public IBaseConformance loadCapabilityStatement(String filename) {
      try {
			FhirContext ctx = FhirContext.forR4();

			InputStream is = null;
			if (filename.startsWith(File.separator)) {
				is = new FileInputStream(filename);
			} else {
				DefaultResourceLoader resourceLoader = new DefaultResourceLoader();
				Resource resource = resourceLoader.getResource(filename);
				is = resource.getInputStream();
			}		
			
			IBaseConformance cs = (IBaseConformance) ctx.newJsonParser().parseResource(is);
			
			return (IBaseConformance) cs;
			
      } catch(Exception e) {
          myLogger.info("Failure to load CapabilityStatement: " + e.getMessage() + " - " + filename);
			 return null;
      }
  }

}