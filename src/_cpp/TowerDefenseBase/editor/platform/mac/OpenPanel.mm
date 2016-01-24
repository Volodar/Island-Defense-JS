//
//  mlOpenPanel.m
//  Brownies_mac
//
//  Created by Владимир Толмачев on 22.03.13.
//
//

#import "OpenPanel.h"
#import <Foundation/Foundation.h>

unsigned openPanelOpenFile(char *file, unsigned length)
{
	if ( file == NULL || length == 0 )
		return false;
	NSOpenPanel * panel = [[NSOpenPanel alloc] init];
	[panel setAllowsMultipleSelection:true];
	NSInteger result = [panel runModal];
	NSArray * array = [panel URLs];
	unsigned value(0);
	
	char * fileIterator = file;
	
	if ( result > 0 )
	{
		for ( unsigned i=0; i<[array count]; ++i)
		{
			NSURL * url = (NSURL*)[array objectAtIndex:i];
			NSString * string(NULL);
			if ( url )
				string = [url path];
			if ( string )
			{
				const char * buf2 = [string UTF8String];
				unsigned needLength = (fileIterator - file) + strlen(buf2) + 1;
				if ( length < needLength )
					break;
				strcpy(fileIterator, buf2);
				fileIterator += strlen(buf2);
				fileIterator[0] = 0x0;
				++fileIterator;
				++value;
			}
		}
	}
	else if ( file )
		file = 0x0;
	[panel release];
	return value;
}

std::string openPanelSaveFile( )
{
	std::string fileResult;
//    NSString *documentFolderPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
    NSSavePanel *panel = [NSSavePanel savePanel];
	
    [panel setMessage:@"Please select a path where to save checkboard as an image."]; // Message inside modal window

	[panel setAllowsOtherFileTypes:YES];
    [panel setExtensionHidden:YES];
    [panel setCanCreateDirectories:YES];
//    [panel setNameFieldStringValue:filename];
    [panel setTitle:@"Saving checkboard..."]; // Window title
//    [panel setAccessoryView:accessoryView1];
	
    NSInteger result = [panel runModal];
    NSError *error = nil;
	
    if (result == NSOKButton) {
        ////////////////////////////////////////////
        NSString *path0 = [[panel URL] path];
		fileResult = [path0 UTF8String];
		
        if (error) {
            [NSApp presentError:error];
        }
    }
	return fileResult;
}

